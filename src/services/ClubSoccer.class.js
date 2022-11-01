class ClubSoccer {
    static singleton = null

    constructor() {
        this.MongoQuery = require("../models/MongoQuery.class")
        this.moment = require('../config/moment');
        this.ToolsAverage = require('./../services/ToolsAverage.class')
        this.Fetch = require('./Fetch.class')
        this.csv = require('csvtojson/v2')

        this.DATABASE = 'SoccerEvent2'

        this.COLLECTION = 'clubSoccerPredictions'
    }

    static init() {
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

    checkFormat(obj) {
        obj['season'] ? obj['season'] = parseInt(obj['season']) : obj['season'] = null
        obj['date'] ? obj['date'] = (obj['date']).toString() : obj['date'] = null
        obj['league_id'] ? obj['league_id'] = parseInt(obj['league_id']) : obj['league_id'] = null
        obj['league'] ? obj['league'] = (obj['league']).toString() : obj['league'] = null
        obj['team1'] ? obj['team1'] = (obj['team1']).toString() : obj['team1'] = null
        obj['team2'] ? obj['team2'] = (obj['team2']).toString() : obj['team2'] = null
        obj['spi1'] ? obj['spi1'] = parseFloat(obj['spi1']) : obj['spi1'] = null
        obj['spi2'] ? obj['spi2'] = parseFloat(obj['spi2']) : obj['spi2'] = null
        obj['prob1'] ? obj['prob1'] = parseFloat(obj['prob1']) : obj['prob1'] = null
        obj['prob2'] ? obj['prob2'] = parseFloat(obj['prob2']) : obj['prob2'] = null
        obj['probtie'] ? obj['probtie'] = parseFloat(obj['probtie']) : obj['probtie'] = null
        obj['proj_score1'] ? obj['proj_score1'] = parseFloat(obj['proj_score1']) : obj['proj_score1'] = null
        obj['proj_score2'] ? obj['proj_score2'] = parseFloat(obj['proj_score2']) : obj['proj_score2'] = null
        obj['importance1'] ? obj['importance1'] = parseFloat(obj['importance1']) : obj['importance1'] = null
        obj['importance2'] ? obj['importance2'] = parseFloat(obj['importance2']) : obj['importance2'] = null
        obj['score1'] ? obj['score1'] = parseInt(obj['score1']) : obj['score1'] = null
        obj['score2'] ? obj['score2'] = parseInt(obj['score2']) : obj['score2'] = null
        obj['xg1'] ? obj['xg1'] = parseFloat(obj['xg1']) : obj['xg1'] = null
        obj['xg2'] ? obj['xg2'] = parseFloat(obj['xg2']) : obj['xg2'] = null
        obj['nsxg1'] ? obj['nsxg1'] = parseFloat(obj['nsxg1']) : obj['nsxg1'] = null
        obj['nsxg2'] ? obj['nsxg2'] = parseFloat(obj['nsxg2']) : obj['nsxg2'] = null
        obj['adj_score1'] ? obj['adj_score1'] = parseFloat(obj['adj_score1']) : obj['adj_score1'] = null
        obj['adj_score2'] ? obj['adj_score2'] = parseFloat(obj['adj_score2']) : obj['adj_score2'] = null
        return obj
    }

    async updateBdd() {
        const response = await this.Fetch.get('GET', 'https://projects.fivethirtyeight.com/soccer-api/club/spi_matches_latest.csv', {}, {})
        const jsonResponse = await this.csv().fromString(response['data']);
        try {
            let cptTrue = 0
            let cptFalse = 0
            for (const index in jsonResponse) {
                const game = this.checkFormat(jsonResponse[index])
                const query = { date: game['date'], team1: game['team1'], team2: game['team2'] }
                const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, query)
               
                if (resFind.length === 0 || ((resFind[0]['score1'] === undefined || !resFind[0]['score2'] === undefined) && (game['score1'] !== null || game['score2'] !== null))) {
                    resFind.length === 1 ? await this.MongoQuery.delete(this.DATABASE, this.COLLECTION, query) : null
                    const resInsert = await this.MongoQuery.insert(this.DATABASE, this.COLLECTION, game)
                    console.log(resInsert);
                }
            }
            console.log('cptTrue:' + cptTrue);
            console.log('cptFalse:' + cptFalse);
        } catch (e) {
            console.log(e);
        }
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
                console.log(game['league']);
                if (game['league_id'] === tmpLeagueId || tmpLeagueId === null) {
                    leagueTmp.push(game)
                    nameLeague = game['league']
                } else {
                    leagues.push({ id: tmpLeagueId, league: nameLeague, games: leagueTmp })
                    nameLeague = game['league']
                    leagueTmp = []
                    leagueTmp.push(game)
                }

                tmpLeagueId = game['league_id']
            })

            leagues.push({ id: tmpLeagueId, league: nameLeague, games: leagueTmp })

            return leagues;
        } catch (e) {
            console.log(e);
        }
    }


    async getById(idGame) {
        try {
            const { ObjectId } = require('mongodb');
            const id = { _id: ObjectId(idGame) }
            const resFind = await this.MongoQuery.find(this.DATABASE, this.COLLECTION, id)
            return resFind[0]
        } catch (e) {
            console.log(e);
        }
    }


    async getByTeam(nameTeam) {
        try {
            const name = { $or: [{ "team1": nameTeam }, { "team2": nameTeam }] }
            const sort = { date: 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, name, sort)
            return resFind
        } catch (e) {
            console.log(e);
        }
    }

    async getExpGoaByTeam(nameTeam) {
        try {
            const name = { $or: [{ "team1": nameTeam }, { "team2": nameTeam }] }
            const sort = { date: 1 }
            const resFind = await this.MongoQuery.sort(this.DATABASE, this.COLLECTION, name, sort)

            let tabExpGoa = []

            resFind.forEach(game => {
                if (game['team1'] === nameTeam && game['xg1']) {
                    tabExpGoa.push({ _id: game['_id'], date: game['date'], our_goals: game['score1'], opp_goals: game['score2'], opponent_goals: game['score2'], our_exp_goa: game['xg1'], opponent_exp_goa: game['xg2'] })
                } else
                    if (game['team2'] === nameTeam && game['xg2']) {
                        tabExpGoa.push({ _id: game['_id'], date: game['date'], our_goals: game['score2'], opp_goals: game['score1'], opponent_goals: game['score1'], our_exp_goa: game['xg2'], opponent_exp_goa: game['xg1'] })
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