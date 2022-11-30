let gamesBasketball = require('../services/GamesBasketball.class')
let ToolsAverage = require('../services/ToolsAverage.class')

exports.gameByDate = async (req, res) => {
    const { strDate } = req.params
    const games = await gamesBasketball.getByDate(strDate)
    res.send(games)
}

exports.gameByRangeDate = async (req, res) => {
    const { startDate, endDate } = req.params
    const games = await gamesBasketball.getByRangeDate(startDate, endDate)
    res.send(games)
}

exports.gameById = async (req, res) => {
    const { idGame } = req.params
    const games = await gamesBasketball.getByGame(parseInt(idGame))
    res.send(games)
}

exports.gameByTeam = async (req, res) => {
    const { idTeam } = req.params
    const games = await gamesBasketball.getByTeam(parseInt(idTeam))
    res.send(games)
}

exports.emaByTeam = async (req, res) => {
    const { idTeam, dateGame } = req.params
    const Games = await gamesBasketball.getByTeam(parseInt(idTeam))
    const statisticsOpponents = await gamesBasketball.getStatisticsOpponents(Games, dateGame, idTeam)
    const scoresDif = gamesBasketball.getScoresDifference(Games, moment(dateGame), idTeam)
    const norm = ToolsAverage.emaMulti(scoresDif)
    const ema2 = ToolsAverage.emaMulti(scoresDif, 5)
    const ema4 = ToolsAverage.emaMulti(scoresDif, 15)
    const ema6 = ToolsAverage.emaMulti(scoresDif, 30)

    const emaTeam = { ema: [{ ema2 }, { ema4 }, { ema6 }, { norm }] }
    res.send({ emaTeam, statisticsOpponents })
}