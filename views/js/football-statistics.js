let graphGame = document.getElementById('graphGame')
let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tablePredictions = document.getElementById('tablePredictions')

let gameId = graphGame.getAttribute('data')
let homeId = graphHome.getAttribute('data')
let awayId = graphAway.getAttribute('data')

console.log(gameId);
console.log(homeId);
console.log(awayId);


const init = async () => {
    const game = await Fetch.get('/api/football-statistics/games-by-id/'+gameId)
    const date = moment.unix(game[0]['startTime'])
    const gamesHome = await Fetch.get('/api/football-statistics/games-by-team/'+homeId)
    const gamesAway = await Fetch.get('/api/football-statistics/games-by-team/'+awayId)
    const actualHomeXg = await Fetch.get('/api/football-statistics/xg-actual-by-team/'+homeId+'/'+moment(date).format('YYYY-MM-DD'))
    const actualAwayXg = await Fetch.get('/api/football-statistics/xg-actual-by-team/'+awayId+'/'+moment(date).format('YYYY-MM-DD'))
    const xgBetweenHome = await Fetch.get('/api/football-statistics/xg-between-goal-team/'+homeId)
    const xgBetweenAway = await Fetch.get('/api/football-statistics/xg-between-goal-team/'+awayId)

    console.log(gamesHome.length);
    console.log(xgBetweenHome.length);
   
    const EMA_BETWEEN = 5
    const EMA_GAMES = 10

    let tabXgBH = []
    let tabXgBA = []

    try {
        for(const index in xgBetweenHome) {
            if (typeof xgBetweenHome[index] !== 'function' && moment(xgBetweenHome[index]['dateTimeGoal']).isBefore(date)) {
                tabXgBH.push(xgBetweenHome[index]['xg'])
            }
        }
    } catch (e) {
        console.log(e);
    }   

    try {
        for(const index in xgBetweenAway) {
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

    try {
        for(const index in gamesHome) {
            const game = gamesHome[index]
            if (typeof game !== "function" && game['xg'] !== undefined && moment.unix(game['startTime']).isBefore(date)) {
                console.log(moment.unix(game['startTime']).format('lll'));
                if (game['homeTeam']['id'] === homeId) {
                    tabHistHome.push(game['xg']['home'])
                } else {
                    tabHistHome.push(game['xg']['away'])
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    try {
        for(const index in gamesAway) {
            const game = gamesAway[index]
            if (typeof game !== "function" && game['xg'] !== undefined && moment.unix(game['startTime']).isBefore(date)) {
                if (game['homeTeam']['id'] === awayId) {
                    tabHistAway.push(game['xg']['home'])
                } else {
                    tabHistAway.push(game['xg']['away'])
                }
            }
        }
    } catch (e) {
        console.log(e);
    }


    ema_XgHH = ToolsAverage.ema(tabHistHome, EMA_GAMES)
    ema_XgHA = ToolsAverage.ema(tabHistAway, EMA_GAMES)


    console.log(tabHistHome);
    
    createTable(
        ['Type', 'EMA', 'Home', 'Away'], 
        [
            ['Histo.', `${EMA_GAMES}`,ema_XgHH.round(), ema_XgHA.round()],
            ['Between', `${EMA_BETWEEN}` , ema_XgBH.round(), ema_XgBA.round()],
            ['Actual', '', actualHomeXg[0]['xg'].round(), actualAwayXg[0]['xg'].round()]            
        ],
        tablePredictions
    )

}



init()