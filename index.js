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



console.log('server run')