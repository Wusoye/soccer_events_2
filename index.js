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
let ToolsAverage = require('./src/services/ToolsAverage.class')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.set('view engine', 'ejs');
app.locals.moment = require('./src/config/moment');

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
    console.log(games.length);
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
    res.render('club-soccer.games-by-id.ejs', { game })
})

console.log('server run')