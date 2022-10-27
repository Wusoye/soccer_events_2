let express = require('express');
let app = express();

let bodyParser = require('body-parser');
let csv = require("csvtojson");
let moment = require('./src/config/moment');
let fs = require("fs");

/** SERVICES */
let { Fetch } = require('./src/services/Fetch.class')
let gamesBasketball = require('./src/services/GamesBasketball.class')

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.set('view engine', 'ejs');
app.locals.moment = require('./src/config/moment');

app.use('/js', express.static('./views/js'))

app.listen(8080);

app.get('/', async (req, res) => {
    res.send({msg: 'coucou'})
})

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

/** EJS */

app.get('/index', async (req, res) => {
    res.render('index.ejs')
})

app.get('/basketball/games-by-date/:strDate?', async (req, res) => {
    let { strDate } = req.params
    if (strDate === undefined) strDate = moment().format('YYYY-MM-DD')
    let games = await gamesBasketball.getByDate(strDate)
    games = gamesBasketball.sortByCountry(games)
    res.render('basketball.games-by-date.ejs', {games})
})

app.get('/basketball/games-by-id/:idGame', async (req, res) => {
    let { idGame } = req.params
    const game = await gamesBasketball.getByGame(parseInt(idGame))


    const homeId = game['teams']['home']['id']
    const awayId = game['teams']['away']['id']
    const dateGame = moment(game['date'])
    const homeGames = await gamesBasketball.getByTeam(game['teams']['home']['id'])
    const awayGames = await gamesBasketball.getByTeam(game['teams']['away']['id'])
    const scoresAvgHome = gamesBasketball.getScoresAverage(homeGames, dateGame, homeId)
    const scoresAvgAway = gamesBasketball.getScoresAverage(awayGames, dateGame, awayId)

    console.log(scoresAvgHome);

    console.log(game);
})

console.log('server run')