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
            let minDate = this.moment(strDate).unix()
            let maxDate = this.moment(strDate).add('24', 'hours').unix()
            
            const query = { $and: [ { "startTime": { $gt: minDate } }, { "startTime": { $lt: maxDate } } ] }
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, query)

            function compareTournament(a, b) {
                a = a['tournament']['id']
                b = b['tournament']['id']
                if (a < b) {
                    return -1
                }
                if (a > b) {
                    return 1
                }
                return 0
            }
            
            
            function compareCountry(a, b) {
                a = a['country']['name']
                b = b['country']['name']
                if (a < b) {
                    return -1
                }
                if (a > b) {
                    return 1
                }
                return 0
            }
            
            function compareDate(a, b){
                let moment = require('../config/moment');
                a = moment.unix(a['startTime'])
                b = moment.unix(b['startTime'])
                if (moment(a).isBefore(b)) {
                    return -1
                }
                if (moment(a).isAfter(b)) {
                    return 1
                }
                return 0
            }

            let as = resFind.sort(compareCountry)
            
            let countryId = null
            let countryName = null
            let countryIdTmp = null
            let countryNameTmp = null
            let tabcountry = []
            let tabcountryTmp = []
            
            for(const indexA in as) {
                let a = as[indexA]
                if (a['country'] !== undefined) {
                    countryId = a['country']['id']
                    countryName = a['country']['name']
                    if (countryIdTmp === null || countryIdTmp !== countryId) {
                        countryIdTmp !== null ? tabcountry.push({country: {id: countryIdTmp, name: countryNameTmp}, tabcountryTmp}) : null
                        tabcountryTmp = []
                        tabcountryTmp.push(a)
                        countryIdTmp = countryId
                        countryNameTmp = countryName
                    } else {
                        tabcountryTmp.push(a)
                        countryIdTmp = countryId
                        countryIdTmp = countryId
                    }
                }
            }
            
            tabcountry.push({country: {id: countryIdTmp, name: countryNameTmp}, tabcountryTmp})
            
            let res = []
            countryId = null
            countryName = null
            
            for(const indexCountry in tabcountry) {
                if (tabcountry[indexCountry]['tabcountryTmp'] !== undefined) {
                    let country = tabcountry[indexCountry]['tabcountryTmp'].sort(compareTournament)
            
                    countryId = country[0]['country']['id']
                    countryName = country[0]['country']['name']
                
                    let leagueIdTmp = null
                    let leagueId = null
                    let leagueNameTmp = null
                    let leagueName = null
                    let tableague = []
                    let tableagueTmp = []
                
                    for(const indexA in country) {
                        let a = country[indexA]
                        if (a['tournament'] !== undefined) {
                            leagueId = a['tournament']['id']
                            leagueName = a['tournament']['name']
                            if (leagueIdTmp === null || leagueIdTmp !== leagueId) {
                                leagueIdTmp !== null ? tableague.push({tournament: {id: leagueIdTmp, name: leagueNameTmp}, games: tableagueTmp.sort(compareDate)}) : null
                                tableagueTmp = []
                                tableagueTmp.push(a)
                                leagueIdTmp = leagueId
                                leagueNameTmp = leagueName
                            } else {
                                tableagueTmp.push(a)
                                leagueIdTmp = leagueId
                                leagueNameTmp = leagueName
                            }
                        }
                    }
                    tableague.push({tournament: {id: leagueIdTmp, name: leagueNameTmp}, games: tableagueTmp.sort(compareDate)})
                    res.push({country: {id: countryId, name: countryName}, tournaments: tableague})
                }
            }

            return res
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
