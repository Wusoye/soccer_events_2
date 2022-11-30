let Fetch = require('../services/Fetch.class')
let clubSoccer = require('../services/ClubSoccer.class')
let ToolsAverage = require('../services/ToolsAverage.class')

exports.gamesUpdate = async (req, res) => {
    await clubSoccer.updateBdd()
}

exports.gamesByDate = async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    let games = await clubSoccer.getByDate(strDate)
    res.send(games)
}

exports.gamesById = async (req, res) => {
    let { idGame } = req.params
    let game = await clubSoccer.getById(idGame)
    res.send(game)
}

exports.gamesByTeam = async (req, res) => {
    let { nameTeam } = req.params
    let games = await clubSoccer.getByTeam(nameTeam)
    res.send(games)
}
 
exports.expGoaByTeam = async (req, res) => {
    let { nameTeam } = req.params
    let expectedGoal = await clubSoccer.getExpGoaByTeam(nameTeam)
    res.send(expectedGoal)
}

exports.eamExpGoaByTeam = async (req, res) => {
    let { nameTeam, periode } = req.params
    let expectedGoal = await clubSoccer.getExpGoaByTeam(nameTeam)

    let expectedGoalEma = []
    expectedGoal.forEach((element, index) => {
        const our_ema = ToolsAverage.emaObj(expectedGoal.slice(0, index + 1), parseInt(periode), 'our_exp_goa')
        const opponent_ema = ToolsAverage.emaObj(expectedGoal.slice(0, index + 1), parseInt(periode), 'opponent_exp_goa')
        expectedGoalEma.push({ ...element, ema: { our_value: parseFloat(our_ema), opponent_value: parseFloat(opponent_ema), periode: parseInt(periode) } })
    });

    res.send(expectedGoalEma)
}
