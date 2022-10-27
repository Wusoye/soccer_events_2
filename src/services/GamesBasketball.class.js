class GamesBasketball {
    static singleton = null

    constructor() {
        this.MongoQuery = require("../models/MongoQuery.class")
        this.moment = require('../config/moment');
        this.Fetch = require('./Fetch.class')

        this.URL_API = 'https://api-basketball.p.rapidapi.com/games'
    
        this.HEADERS_API_BASKETBALL = {
            'X-RapidAPI-Key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0',
            'X-RapidAPI-Host': 'api-basketball.p.rapidapi.com'
        }
    
        this.DATABASE = 'SoccerEvent2'

        this.COLLECTION = 'gamesBasketball'
    }

    static init () {
        if (this.singleton == null) {
            this.singleton = new GamesBasketball()
        }
        return this.singleton
    }

    getRandom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        console.log(Math.floor(Math.random() * (max - min + 1) + min));
        return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    }

    async sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
    
    async getByDate(strDate) {
        const momentNow = this.moment(this.moment().format('YYYY-MM-DD'))
        try {
            // AJOUTER UNE CONDITION AVEC REGEX
            if (strDate === undefined || strDate === '') throw new Error('Error params')
            const date = { date: this.moment(strDate).format('YYYY-MM-DD') }
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, date)

            const notUpToDate = resFind[0] ? (this.moment(resFind[0].dateAjout) < this.moment(date.date) && this.moment(date.date) < momentNow) : false

            if (resFind.length === 0 || notUpToDate) {
                console.log(notUpToDate);
                if (notUpToDate) await this.MongoQuery.delete(this.DATABASE, this.COLLECTION, date)
                let games = await this.Fetch.get('GET', this.URL_API, date, this.HEADERS_API_BASKETBALL)
                const parameters = games.data.parameters.date
                const response = games.data.response
                const data = { date: parameters, dateAjout: this.moment().format('YYYY-MM-DD'), games: response }
                const resInsert = await this.MongoQuery.insert(this.DATABASE, this.COLLECTION, data)

                console.log(resInsert)
                return data
            } else {
                return resFind
            }

        } catch (e) {
            console.dir(e)
            return { error: e.message }
        }
    }

    async getByRangeDate(startDate, endDate) {
        let start = this.moment(startDate)
        const end = this.moment(endDate)
        const momentNow = this.moment(this.moment().format('YYYY-MM-DD'))

        let toReturn = []

        while (this.moment(start).isBefore(end, 'day')) {
            console.log(start);
            try {
                // AJOUTER UNE CONDITION AVEC REGEX
                if (start === undefined || start === '') throw new Error('Error params')
                let date = { date: this.moment(start).format('YYYY-MM-DD') }
                let resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, date)

                let notUpToDate = resFind[0] ? (this.moment(resFind[0].dateAjout) < this.moment(date.date) && this.moment(date.date) < momentNow) : false

                if (resFind.length === 0 || notUpToDate) {
                    if (notUpToDate) await this.MongoQuery.delete(this.DATABASE, this.COLLECTION, date)
                    let games = await this.Fetch.get('GET', this.URL_API, date, this.HEADERS_API_BASKETBALL)
                    let parameters = games.data.parameters.date
                    let response = games.data.response
                    let data = { date: parameters, dateAjout: this.moment().format('YYYY-MM-DD'), games: response }
                    let resInsert = await this.MongoQuery.insert(this.DATABASE, this.COLLECTION, data)

                    console.log(resInsert)
                    toReturn.push(data)
                    this.sleep(this.getRandom(6000, 8000))
                } else {
                    toReturn.push(resFind)
                }

                
                start = this.moment(start).add(1, 'days')
            } catch (e) {
                console.dir(e)
                return { error: e.message }
            }
        }

        return toReturn
    }

    async getByGame(idGame) {
        let toReturn = null
        try {
            if (typeof idGame !== "number") throw new Error('Error params')
            const game = { "games.id" : parseInt(idGame) }
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, game)

            if (resFind.length === 0) {
                throw new Error('No game fund')
            } else {
                if (resFind.length !== 1) throw new Error('So much games')
                resFind[0].games.forEach(async game => {
                    if (game['id'] === parseInt(idGame)) {
                        toReturn = game
                    };
                });
            }
            return toReturn
        } catch (e) {
            console.dir(e)
            return { error: e.message }
        }
    }

    async getByTeam(idTeam) {
        let toReturn = []
        try {
            if (typeof idTeam !== "number") throw new Error('Error params')
            const game = {$or: [ { "games.teams.home.id" : parseInt(idTeam) }, { "games.teams.away.id" : parseInt(idTeam) } ] } 
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, game)

            if (resFind.length === 0) {
                throw new Error('No game fund')
            } else {
                resFind.forEach(async res => {
                    res.games.forEach(async game => {
                        if (game['teams']['home']['id'] === parseInt(idTeam) || game['teams']['away']['id'] === parseInt(idTeam)) {
                            toReturn.push(game)
                        };
                    });
                })
            }
            return toReturn
        } catch (e) {
            console.dir(e)
            return { error: e.message }
        }
    }

    sortByCountry(games) {
        function compareCountry(a, b) {
            if (a['country']['id'] < b['country']['id']) {
                return -1;
            }
            if (a['country']['id'] < b['country']['id']) {
                return 1;
            }
            // a must be equal to b
            return 0;
        }

        let gamesSortCountry = games['games'] ? games['games'].sort(compareCountry) : games[0]['games'].sort(compareCountry)
    
        let country = []
        let countryTmp = []
        let tmpCountryId = null
    
        gamesSortCountry.forEach(game => {
            if (game['country']['id'] === tmpCountryId || tmpCountryId === null) {
                countryTmp.push(game)
            } else {
                country.push(countryTmp)
                countryTmp = []
                countryTmp.push(game)
            }
            tmpCountryId = game['country']['id']
        })

        return country
    }

    getScoresAverage(games, dateGame, idTeam) {
        let scoresAvgHome = []

        games.forEach(game => {
            if (moment(game['date']).isBefore(dateGame)) {
                if (game['teams']['home']['id'] === idTeam) {
                    let scoreAvg = game['scores']['home']['total'] / game['scores']['away']['total']
                    scoresAvgHome.push({date: moment(game['date']), scoreAvg: scoreAvg})
                } else if (game['teams']['away']['id'] === idTeam) {
                    let scoreAvg = game['scores']['away']['total'] / game['scores']['home']['total']
                    scoresAvgHome.push({date: moment(game['date']), scoreAvg: scoreAvg})
                }
            }
        })

        return scoresAvgHome
    }

}

const gamesBasketball = GamesBasketball.init()

module.exports = gamesBasketball