class FootballStatistics {
    static singleton = null

    constructor() {
        this.MongoQuery = require("../models/MongoQuery.class")
        this.moment = require('../config/moment');
        this.ToolsAverage = require('./../services/ToolsAverage.class')
        this.Fetch = require('./Fetch.class')

        this.URL_API = 'https://football-xg-statistics.p.rapidapi.com/'

        this.HEADERS_API_FOOTBALL_STATISTICS = {
            'X-RapidAPI-Key': 'c5b77243e3mshe9ba9a33f164ba5p149e4bjsn1c1fdd2bc8f0',
            'X-RapidAPI-Host': 'football-xg-statistics.p.rapidapi.com'
        }

        this.DATABASE = 'SoccerEvent2'

        this.COLLECTION = 'footballStatistics'
    }

    static init() {
        if (this.singleton == null) {
            this.singleton = new FootballStatistics()
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

    async getCountries() {
        try {
            const URL = this.URL_API + 'countries/'
            const response = await this.Fetch.get('GET', URL, {}, this.HEADERS_API_FOOTBALL_STATISTICS)
            return response['data']
        } catch (e) {
            console.log(e);
        }
    }

    async getTournamentsByCountrie(idCountrie) {
        try {
            const URL = this.URL_API + 'countries/' + idCountrie + '/tournaments/'
            const response = await this.Fetch.get('GET', URL, {}, this.HEADERS_API_FOOTBALL_STATISTICS)
            return response['data']
        } catch (e) {
            console.log(e);
        }
    }

    async getSeasonsByTournament(idTournament) {
        try {
            const URL = this.URL_API + 'tournaments/' + idTournament + '/seasons/'
            const response = await this.Fetch.get('GET', URL, {}, this.HEADERS_API_FOOTBALL_STATISTICS)
            return response['data']
        } catch (e) {
            console.log(e);
        }
    }

    async getFixturesBySeason(idSeason) {
        try {
            const URL = this.URL_API + 'seasons/' + idSeason + '/fixtures/'
            const response = await this.Fetch.get('GET', URL, {}, this.HEADERS_API_FOOTBALL_STATISTICS)
            return response['data']
        } catch (e) {
            console.log(e);
        }
    }

    async insertFixturesBySeason(idSeason) {
        try {
            const URL = this.URL_API + 'seasons/' + idSeason + '/fixtures/'
            const response = await this.Fetch.get('GET', URL, {}, this.HEADERS_API_FOOTBALL_STATISTICS)
            const fixtures = response['data']['result']
            for (const index in fixtures) {
                const fixture = fixtures[index]
                if (typeof fixture !== "function") {
                const idFixture = parseInt(fixture['id'])
                const query = { id: idFixture }
                const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, query)
                    if (resFind.length === 0) {
                        //console.log(resFind);
                        //console.log('insert');
                        await this.MongoQuery.insert(this.DATABASE, this.COLLECTION, fixture)
                    } else if (resFind.length === 1 && resFind[0]['homeScore'] === undefined && fixture['homeScore'] !== undefined) {
                        //console.log(resFind);
                        //console.log('update');
                        await this.MongoQuery.delete(this.DATABASE, this.COLLECTION, query)
                        await this.MongoQuery.insert(this.DATABASE, this.COLLECTION, fixture)
                    } else {
                        //console.log(resFind);
                        //console.log('none');
                    }
                }
            }
            console.log('Insert completed !!');
            return response['data']
        } catch (e) {
            console.log(e);
        }
    }

    async getByDate(strDate) {
        try {
            strDate = this.moment(strDate)
            const query = {}
            const sort = { "country.name": 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, query, sort)
            let games = []
            for (const index in resFind) {
                const game = resFind[index]
                const dateGame = this.moment.unix(game['startTime'])
                if (this.moment(strDate).isSame(dateGame, 'day')) {
                    games.push(game)
                }
            }

            function compareCountry(a, b) {
                if (a['country']['name'] < b['country']['name']) {
                    return -1;
                }
                if (a['country']['name'] > b['country']['name']) {
                    return 1;
                }
                return 0;
            }


            function compareTournament(a, b) {
                if (a['tournament']['name'] < b['tournament']['name']) {
                    return -1;
                }
                if (a['tournament']['name'] > b['tournament']['name']) {
                    return 1;
                }
                return 0;
            }


            games = games.sort(compareCountry)

            let countryIdTmp = null
            let countryGames = {}
            let countryGameTmp = []
            let countryName = null

            for(const gameIndex in games) {
                const game = games[gameIndex]
                if (typeof game !== "function") {
                    const countryId = game['country']['id']
                    if (countryId === countryIdTmp || countryIdTmp === null) {
                        countryName = game['country']['name']
                        countryIdTmp = countryId
                        countryGameTmp.push(game)
                    } else {
                        //countryGames.push({[countryName]: countryGameTmp})
                        countryGames = {...countryGames, [countryName]: countryGameTmp}
                        countryGameTmp = []
                        countryName = game['country']['name']
                        countryIdTmp = countryId
                        countryGameTmp.push(game)
                    }
                }
            }

            countryGames = {...countryGames, [countryName]: countryGameTmp}

            return countryGames
        } catch (e) {
            console.log(e);
        }
    }


    async getById(idGame) {
        try {
            idGame = parseInt(idGame)
            const query = { id: idGame }
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, query)
            return resFind
        } catch (e) {
            console.log(e);
        }
    }

    async getByTeam(idTeam) {
        try {
            idTeam = parseInt(idTeam)
            const query = { $or: [{ "homeTeam.id": idTeam }, { "awayTeam.id": idTeam }] }
            const sort = { "startTime": 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, query, sort)
            return resFind
        } catch (e) {
            console.log(e);
        }
    }

    async getByPlayer(idPlayer) {
        try {
            idPlayer = parseInt(idPlayer)
            const query = { "events.author.id": idPlayer }
            const sort = { "startTime": 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, query, sort)
            return resFind
        } catch (e) {
            console.log(e);
        }
    }

    setXgByPlayer(events) {
        function comparePlayer(a, b) {
            if (a['author']['id'] < b['author']['id']) {
                return -1;
            }
            if (a['author']['id'] > b['author']['id']) {
                return 1;
            }
            return 0;
        }

        let players = []
        let idPlayer = null
        let idPlayerTmp = null
        let xgPlayer = null
        let goalPlayer = null
        let namePlayer = null
        let teamId = null
        events.sort(comparePlayer).forEach(event => {
            idPlayerTmp = event['author']['id']
            if (idPlayerTmp !== idPlayer) {
                if (idPlayer !== null) {
                    players.push({ teamId: teamId, id: idPlayer, name: namePlayer, xg: xgPlayer, goal: goalPlayer })
                }
                teamId = event['teamId']
                idPlayer = event['author']['id']
                namePlayer = event['author']['name']
                xgPlayer = event['xg']
                goalPlayer = 0
                if (event['type'] === 'goal') {
                    goalPlayer++
                }
            } else {
                xgPlayer = xgPlayer + event['xg']
                if (event['type'] === 'goal') {
                    goalPlayer++
                }
            }
        })
        players.push({ teamId: teamId, id: idPlayer, name: namePlayer, xg: xgPlayer, goal: goalPlayer })

        return players
    }

    async getXgByGame(idGame) {
        try {
            idGame = parseInt(idGame)
            const query = { id: idGame }
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, query)
            let events = resFind[0]['events']
            let players = this.setXgByPlayer(events)
            let obj = { ...resFind[0], players }
            return [obj]
        } catch (e) {
            console.log(e);
        }
    }

    async getXgBetweenGoalPlayer(idPlayer) {
        try {
            idPlayer = parseInt(idPlayer)
            const games = await this.getByPlayer(idPlayer)
            let tabRes = []
            let xgB = 0
            let dateTimeGoal = null
           
            for(const gameIndex in games) {
                const game = games[gameIndex]
                for(const enventIndex in game['events']){
                    const event = game['events'][enventIndex]
                    if (typeof event !== "function" && event['author']['id'] === idPlayer) {
                   
                        if (event['type'] === 'goal') {
                            dateTimeGoal = this.moment.unix(game['startTime']).add(event['minute'], 'minutes')
                            xgB = xgB + event['xg']
                            tabRes.push({dateTimeGoal, xg: xgB})
                            xgB = 0
                        } else {
                            xgB = xgB + event['xg']
                        }
                    }
                }
            }

      
            return tabRes
        } catch (e) {
            console.log(e);
        }
    }


    async getXgBetweenGoalTeam(idTeam) {
        try {
            idTeam = parseInt(idTeam)
            const games = await this.getByTeam(idTeam)
            let tabRes = []
            let xgB = 0
            let dateTimeGoal = null
            for(const gameIndex in games) {
                const game = games[gameIndex]
                for(const enventIndex in game['events']){
                    const event = game['events'][enventIndex]
                    if (typeof event !== "function" && event['teamId'] === idTeam) {
                  
                        if (event['type'] === 'goal') {
                            dateTimeGoal = this.moment.unix(game['startTime']).add(event['minute'], 'minutes')
                            xgB = xgB + event['xg']
                            tabRes.push({dateTimeGoal, xg: xgB})
                            xgB = 0
                        } else {
                            xgB = xgB + event['xg']
                        }
                    }
                }
            }

            return tabRes
        } catch (e) {
            console.log(e);
        }
    }


    async getXgAtDateByPlayer(idPlayer, dateTime) {
        try {
            idPlayer = parseInt(idPlayer)
            dateTime = this.moment(dateTime)
            const games = await this.getByPlayer(idPlayer)
            let tabRes = []
            let xgB = 0
            let namePlayer = null
            let dateTimeGoal = null
            let dateTimeGoalLastGoal = null
            let stop = true
            for(const gameIndex in [...games].reverse()) {
                const game = [...games].reverse()[gameIndex]
                if (game['events'] !== undefined && game['events'].length > 0) {
                    const events = [...game['events']].reverse()
                    for(const enventIndex in events){
                        const event = events[enventIndex]
                        if (typeof event !== "function" && event['author']['id'] === idPlayer) {
                            namePlayer = event['author']['name']
                            dateTimeGoal = this.moment.unix(game['startTime']).add(event['minute'], 'minutes')
                            if (this.moment(dateTimeGoal).isBefore(dateTime) && event['type'] !== 'goal' && stop) {
                                xgB = xgB + event['xg']
                            } else if (this.moment(dateTimeGoal).isBefore(dateTime) && event['type'] === 'goal' && stop) {
                                dateTimeGoalLastGoal = dateTimeGoal
                                stop = false
                            }

                        }
                    }
                }               
            }

            console.log({player: {id: idPlayer, name: namePlayer}, xg: xgB, lastGoal: dateTimeGoalLastGoal, dateTime});
            return [{player: {id: idPlayer, name: namePlayer}, xg: xgB, lastGoal: dateTimeGoalLastGoal, dateTime}]
        } catch (e) {
            console.log(e);
        }
    }


    async getXgAtDateByTeam(idTeam, dateTime) {
        try {
            idTeam = parseInt(idTeam)
            dateTime = this.moment(dateTime)
            const games = await this.getByTeam(idTeam)
            let tabRes = []
            let xgB = 0
            let nameTeam = null
            let dateTimeGoal = null
            let dateTimeGoalLastGoal = null
            let stop = true
            for(const gameIndex in [...games].reverse()) {
                const game = [...games].reverse()[gameIndex]
                if (game['events'] !== undefined && game['events'].length > 0) {
                    const events = [...game['events']].reverse()
                    for(const enventIndex in events){
                        const event = events[enventIndex]
                        if (typeof event !== "function" && event['teamId'] === idTeam) {
                            game['homeTeam']['id'] ===  idTeam ? nameTeam = game['homeTeam']['name'] : nameTeam = game['awayTeam']['name']
                            dateTimeGoal = this.moment.unix(game['startTime']).add(event['minute'], 'minutes')
                            if (this.moment(dateTimeGoal).isBefore(dateTime) && event['type'] !== 'goal' && stop) {
                                xgB = xgB + event['xg']
                            } else if (this.moment(dateTimeGoal).isBefore(dateTime) && event['type'] === 'goal' && stop) {
                                dateTimeGoalLastGoal = dateTimeGoal
                                stop = false
                            }

                        }
                    }
                }               
            }

            return [{team: {id: idTeam, name: nameTeam}, xg: xgB, lastGoal: dateTimeGoalLastGoal, dateTime}]
        } catch (e) {
            console.log(e);
        }
    }


    async getXgByTeam(idTeam) {
        try {
            idTeam = parseInt(idTeam)
            const games = await this.getByTeam(idTeam)
            let tabRes = []
            for(const gameIndex in games) {
                const game = games[gameIndex]
                if (typeof game !== "function" && game['homeTeam']['id'] === idTeam && game['xg'] !== undefined) {
                    tabRes.push({team: {id: game['homeTeam']['id'], name: game['homeTeam']['name']}, gameId: game['id'], date: this.moment.unix(game['startTime']), our: game['xg']['home'], opp: game['xg']['away']})
                } else if (typeof game !== "function" && game['xg'] !== undefined) {
                    tabRes.push({team: {id: game['awayTeam']['id'], name: game['awayTeam']['name']}, gameId: game['id'], date: this.moment.unix(game['startTime']), opp: game['xg']['home'], our: game['xg']['away']})
                }
            }

            return tabRes
        } catch (e) {
            console.log(e);
        }
    }

}

const footballStatistics = FootballStatistics.init()

module.exports = footballStatistics
