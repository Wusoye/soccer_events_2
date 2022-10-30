class ClubSoccer {
    static singleton = null

    constructor() {
        this.MongoQuery = require("../models/MongoQuery.class")
        this.moment = require('../config/moment');
        this.ToolsAverage = require('./../services/ToolsAverage.class')
    
        this.DATABASE = 'SoccerEvent2'

        this.COLLECTION = 'clubSoccerPredictions'
    }

    static init () {
        if (this.singleton == null) {
            this.singleton = new ClubSoccer()
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
        try {
            const date = { date: this.moment(strDate).format('YYYY-MM-DD') }
            const sort = { league: 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, date, sort)
            //console.log(resFind);

            let leagues = []
            let leagueTmp = []
            let tmpLeagueId = null
            let nameLeague = null
        
            resFind.forEach(game => {
                if (game['league_id'] === tmpLeagueId || tmpLeagueId === null) {
                    leagueTmp.push(game)
                    nameLeague = game['league']
                } else {
                    leagues.push({id: tmpLeagueId, league: nameLeague, games: leagueTmp})
                    leagueTmp = []
                    leagueTmp.push(game)
                }
                tmpLeagueId = game['league_id']
            })

            return leagues;
        } catch (e) {
            console.log(e);
        }
    }


    async getById(idGame) {
        try {
            const {ObjectId} = require('mongodb');
            const id = { _id: ObjectId(idGame) }
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, id)
            return resFind[0]
        } catch (e) {
            console.log(e);
        }
    }


    async getByTeam(nameTeam) {
        try {
            const name = {$or: [ { "team1" : nameTeam }, { "team2" : nameTeam } ] } 
            const sort = { date: 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, name, sort)
            return resFind
        } catch (e) {
            console.log(e);
        }
    }

    async getExpGoaByTeam(nameTeam) {
        try {
            const name = {$or: [ { "team1" : nameTeam }, { "team2" : nameTeam } ] } 
            const sort = { date: 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, name, sort)
            
            let tabExpGoa = []

            resFind.forEach(game => {
                if (game['team1'] === nameTeam && game['xg1']) {
                    tabExpGoa.push({_id: game['_id'], date: game['date'], our_goals: game['score1'], opponent_goals: game['score2'], our_exp_goa: game['xg1'], opponent_exp_goa: game['xg2']})
                } else 
                if (game['team2'] === nameTeam && game['xg2']) {
                    tabExpGoa.push({_id: game['_id'], date: game['date'], our_goals: game['score2'], opponent_goals: game['score1'], our_exp_goa: game['xg2'], opponent_exp_goa: game['xg1']})
                }
            })

            return tabExpGoa
        } catch (e) {
            console.log(e);
        }
    }
}

const clubSoccer = ClubSoccer.init()

module.exports = clubSoccer