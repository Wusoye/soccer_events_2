let express = require('express');
let app = express();

let bodyParser = require('body-parser');
let csv = require("csvtojson");
let moment = require('./src/config/moment');
let fs = require("fs");

/** SERVICES */
let Fetch = require('./src/services/Fetch.class')
let gamesBasketball = require('./src/services/GamesBasketball.class')
let clubSoccer = require('./src/services/ClubSoccer.class')
let footballStatistics = require('./src/services/FootballStatistics.class')
let ToolsAverage = require('./src/services/ToolsAverage.class')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.set('view engine', 'ejs');
app.locals.moment = require('./src/config/moment');
app.locals.header = undefined

app.use('/js', express.static('./views/js'))

app.listen(8080);

app.get('/', async (req, res) => {
    res.send({ msg: 'coucou' })
})

/** MATH ODDS EVENTS */

app.get('/math-odds-events/games-by-date/:strDate?', async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    const url = 'https://www.oddsmath.com/api/v1/events-by-day.json/?language=en&country_code=FR&timezone=Europe%2FParis&day=' + strDate + '&grouping_mode=0'
    const response = await Fetch.get('GET', url, {}, {})
    res.render('math-odds-events.games-by-date.ejs', { items: response.data.data })
});


/** api-basketball.p.rapidapi */

app.get('/api/basketball/games-by-date/:strDate', async (req, res) => {
    const { strDate } = req.params
    const games = await gamesBasketball.getByDate(strDate)
    res.send(games)
})

app.get('/api/basketball/games-by-range-date/:startDate/:endDate', async (req, res) => {
    const { startDate, endDate } = req.params
    const games = await gamesBasketball.getByRangeDate(startDate, endDate)
    res.send(games)
})

app.get('/api/basketball/games-by-id/:idGame', async (req, res) => {
    const { idGame } = req.params
    const games = await gamesBasketball.getByGame(parseInt(idGame))
    res.send(games)
})

app.get('/api/basketball/games-by-team/:idTeam', async (req, res) => {
    const { idTeam } = req.params
    const games = await gamesBasketball.getByTeam(parseInt(idTeam))
    res.send(games)
})

app.get('/api/basketball/ema-by-team/:idTeam/:dateGame', async (req, res) => {
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
})

/** EJS */

app.get('/index', async (req, res) => {
    res.render('index.ejs')
})

app.get('/basketball/games-by-date/:strDate?', async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    let games = await gamesBasketball.getByDate(strDate)
    games = gamesBasketball.sortByCountry(games)
    res.render('basketball.games-by-date.ejs', { games })
})

app.get('/basketball/games-by-id/:idGame', async (req, res) => {
    let { idGame } = req.params
    const game = await gamesBasketball.getByGame(parseInt(idGame))
    res.render('basketball.games-by-id.ejs', { game })
})


/** clubSoccerPredicitions fivethirtyeight */

app.get('/api/club-soccer/games-update', async (req, res) => {
    await clubSoccer.updateBdd()
})

app.get('/api/club-soccer/games-by-date/:strDate?', async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    let games = await clubSoccer.getByDate(strDate)
    res.send(games)
})

app.get('/api/club-soccer/games-by-id/:idGame', async (req, res) => {
    let { idGame } = req.params
    let game = await clubSoccer.getById(idGame)
    res.send(game)
})

app.get('/api/club-soccer/games-by-team/:nameTeam', async (req, res) => {
    let { nameTeam } = req.params
    let games = await clubSoccer.getByTeam(nameTeam)
    res.send(games)
})

app.get('/api/club-soccer/expected-goal-by-team/:nameTeam', async (req, res) => {
    let { nameTeam } = req.params
    let expectedGoal = await clubSoccer.getExpGoaByTeam(nameTeam)
    res.send(expectedGoal)
})

app.get('/api/club-soccer/ema-expected-goal-by-team/:nameTeam/:periode', async (req, res) => {
    let { nameTeam, periode } = req.params
    let expectedGoal = await clubSoccer.getExpGoaByTeam(nameTeam)

    let expectedGoalEma = []
    expectedGoal.forEach((element, index) => {
        const our_ema = ToolsAverage.emaObj(expectedGoal.slice(0, index + 1), parseInt(periode), 'our_exp_goa')
        const opponent_ema = ToolsAverage.emaObj(expectedGoal.slice(0, index + 1), parseInt(periode), 'opponent_exp_goa')
        expectedGoalEma.push({ ...element, ema: { our_value: parseFloat(our_ema), opponent_value: parseFloat(opponent_ema), periode: parseInt(periode) } })
    });

    res.send(expectedGoalEma)
})

/** EJS */


app.get('/club-soccer/games-by-date/:strDate?', async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    let games = await clubSoccer.getByDate(strDate)
    res.render('club-soccer.games-by-date.ejs', { games })
})

app.get('/club-soccer/games-by-id/:idGame', async (req, res) => {
    let { idGame } = req.params
    let game = await clubSoccer.getById(idGame)
    game !== undefined ? header = game['team1'] + '-' + game['team2'] : header = null
    res.render('club-soccer.games-by-id.ejs', { game, header })
})


/** FootballStatistics */


app.get('/api/football-statistics/countries', async (req, res) => {
    const countries = await footballStatistics.getCountries()
    res.send(countries)
})

app.get('/api/football-statistics/tournaments-by-countrie/:idCountrie', async (req, res) => {
    const { idCountrie } = req.params
    const tournaments = await footballStatistics.getTournamentsByCountrie(idCountrie)
    res.send(tournaments)
})

app.get('/api/football-statistics/seasons-by-tournament/:idTournament', async (req, res) => {
    const { idTournament } = req.params
    const seasons = await footballStatistics.getSeasonsByTournament(idTournament)
    res.send(seasons)
})


app.get('/api/football-statistics/fixtures-by-season/:idSeason', async (req, res) => {
    const { idSeason } = req.params
    const fixtures = await footballStatistics.getFixturesBySeason(idSeason)
    res.send(fixtures)
})

app.get('/api/football-statistics/insert-fixtures-by-season/:idSeason', async (req, res) => {
    const { idSeason } = req.params
    const fixtures = await footballStatistics.insertFixturesBySeason(idSeason)
    res.send(fixtures)
})

app.get('/api/football-statistics/games-by-date/:strDate?', async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    const games = await footballStatistics.getByDate(strDate)
    res.send(games)
})

app.get('/api/football-statistics/games-by-id/:idGame', async (req, res) => {
    let { idGame } = req.params
    const game = await footballStatistics.getById(idGame)
    res.send(game)
})

app.get('/api/football-statistics/games-by-team/:idTeam', async (req, res) => {
    let { idTeam } = req.params
    const games = await footballStatistics.getByTeam(idTeam)
    res.send(games)
})

app.get('/api/football-statistics/games-by-player/:idPlayer', async (req, res) => {
    let { idPlayer } = req.params
    const games = await footballStatistics.getByPlayer(idPlayer)
    res.send(games)
})


app.get('/api/football-statistics/xg-by-game/:idGame', async (req, res) => {
    let { idGame } = req.params
    const games = await footballStatistics.getXgByGame(idGame)
    res.send(games)
})

app.get('/api/football-statistics/xg-by-team/:idTeam', async (req, res) => {
    let { idTeam } = req.params
    const data = await footballStatistics.getXgByTeam(idTeam)
    res.send(data)
})

app.get('/api/football-statistics/xg-between-goal-player/:idPlayer', async (req, res) => {
    let { idPlayer } = req.params
    const data = await footballStatistics.getXgBetweenGoalPlayer(idPlayer)
    res.send(data)
})

app.get('/api/football-statistics/xg-between-goal-team/:idTeam', async (req, res) => {
    let { idTeam } = req.params
    const data = await footballStatistics.getXgBetweenGoalTeam(idTeam)
    res.send(data)
})

app.get('/api/football-statistics/xg-actual-by-player/:idPlayer/:dateTime?', async (req, res) => {
    let { idPlayer, dateTime } = req.params
    if (dateTime === undefined) dateTime = moment()
    const data = await footballStatistics.getXgAtDateByPlayer(idPlayer, dateTime)
    res.send(data)
})

app.get('/api/football-statistics/xg-actual-by-team/:idTeam/:dateTime?', async (req, res) => {
    let { idTeam, dateTime } = req.params
    if (dateTime === undefined) dateTime = moment()
    const data = await footballStatistics.getXgAtDateByTeam(idTeam, dateTime)
    res.send(data)
})


/** EJS */

app.get('/football-statistics/games-by-date/:strDate?', async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    const games = await footballStatistics.getByDate(strDate)
    res.render('football-statistics.games-by-date.ejs', {games})
})

app.get('/football-statistics/games-by-id/:idGame', async (req, res) => {
    let { idGame } = req.params
    const game = await footballStatistics.getById(idGame)
    header = game[0]['homeTeam']['name'] + ' - ' + game[0]['awayTeam']['name']
    res.render('football-statistics.games-by-id.ejs', {game: game[0], header})
})

console.log('server run')