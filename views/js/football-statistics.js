let graphGame = document.getElementById('graphGame')
let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tablePredictions = document.getElementById('tablePredictions')

let gameId = parseInt(graphGame.getAttribute('data'))
let homeId = parseInt(graphHome.getAttribute('data'))
let awayId = parseInt(graphAway.getAttribute('data'))

console.log(gameId);
console.log(homeId);
console.log(awayId);


const init = async () => {
    const game = await Fetch.get('/api/football-statistics/games-by-id/' + gameId)
    const date = moment.unix(game[0]['startTime'])
    const gamesHome = await Fetch.get('/api/football-statistics/games-by-team/' + homeId)
    const gamesAway = await Fetch.get('/api/football-statistics/games-by-team/' + awayId)
    const actualHomeXg = await Fetch.get('/api/football-statistics/xg-actual-by-team/' + homeId + '/' + moment(date).format('YYYY-MM-DD'))
    const actualAwayXg = await Fetch.get('/api/football-statistics/xg-actual-by-team/' + awayId + '/' + moment(date).format('YYYY-MM-DD'))
    const xgBetweenHome = await Fetch.get('/api/football-statistics/xg-between-goal-team/' + homeId)
    const xgBetweenAway = await Fetch.get('/api/football-statistics/xg-between-goal-team/' + awayId)


    console.log(game);


    createTable(
        ['Odds', 'Home', 'Draw', 'Away'], 
        [
            ['Open', game[0]['odds'][0]['open'], game[0]['odds'][1]['open'], game[0]['odds'][2]['open']],
            ['Last', game[0]['odds'][0]['last'], game[0]['odds'][1]['last'], game[0]['odds'][2]['last']]
        ],
        tablePredictions
    )


    const EMA_BETWEEN = 30
    const EMA_GAMES = 10
    const EMA_GAMES_TAB = [3, 30]

    let tabXgBH = []
    let tabXgBA = []

    try {
        for (const index in xgBetweenHome) {
            if (typeof xgBetweenHome[index] !== 'function' && moment(xgBetweenHome[index]['dateTimeGoal']).isBefore(date)) {
                tabXgBH.push(xgBetweenHome[index]['xg'])
            }
        }
    } catch (e) {
        console.log(e);
    }

    try {
        for (const index in xgBetweenAway) {
            if (typeof xgBetweenAway[index] !== 'function' && moment(xgBetweenAway[index]['dateTimeGoal']).isBefore(date)) {
                tabXgBA.push(xgBetweenAway[index]['xg'])
            }
        }
    } catch (e) {
        console.log(e);
    }

    ema_XgBH = ToolsAverage.ema(tabXgBH, EMA_BETWEEN)
    ema_XgBA = ToolsAverage.ema(tabXgBA, EMA_BETWEEN)

    let tabHistHome = []
    let tabHistAway = []

    function compareGameDate(a, b) {
        a = moment.unix(a['startTime'])
        b = moment.unix(b['startTime'])
        if (moment(a).isBefore(b)) {
            return -1;
        }
        if (moment(a).isAfter(b)) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }

    let gamesHomeSort = gamesHome.sort(compareGameDate)
    let gamesAwaySort = gamesAway.sort(compareGameDate)

    try {
        for (const index in gamesHomeSort) {
            const game = gamesHomeSort[index]
            if (typeof game !== "function" && game['xg'] !== undefined && moment.unix(game['startTime']).isBefore(date)) {
                if (game['homeTeam']['id'] === homeId) {
                    tabHistHome.push(game['xg']['home'] / game['xg']['away'])
                } else {
                    tabHistHome.push(game['xg']['away'] / game['xg']['home'])
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    try {
        for (const index in gamesAwaySort) {
            const game = gamesAwaySort[index]
            if (typeof game !== "function" && game['xg'] !== undefined && moment.unix(game['startTime']).isBefore(date)) {
                
                if (game['homeTeam']['id'] === awayId) {
                    console.log(game['homeTeam']['name']);
                    tabHistAway.push(game['xg']['home'] / game['xg']['away'])
                } else {
                    console.log(game['awayTeam']['name']);
                    tabHistAway.push(game['xg']['away'] / game['xg']['home'])
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    let tabEmaHisto = []

    for (let i = 0; i < EMA_GAMES_TAB.length; i++) {
        try {
            let periode = EMA_GAMES_TAB[i]
            tabEmaHisto.push([
                `${periode}`,
                ToolsAverage.ema(tabHistHome, periode).round(2),
                ToolsAverage.ema(tabHistAway, periode).round(2)
            ])
        } catch (e) {
            console.log(e);
        }
    }


    createTable(
        ['Periode EMA', 'Home', 'Away'],
        tabEmaHisto,
        tablePredictions
    )

    createTable(
        ['Type', 'EMA', 'Home', 'Away'],
        [
            ['Between', `${EMA_BETWEEN}`, ema_XgBH.round(), ema_XgBA.round()],
            ['Actual', '', actualHomeXg[0]['xg'].round(), actualAwayXg[0]['xg'].round()]
        ],
        tablePredictions
    )

}



init()