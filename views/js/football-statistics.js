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

let redHexa = '#D53636'
let greenHexa = '#4CAA1B'

let datasGame = {
    [homeId]: {
        games: []
    },

    [awayId]: {
        games: []
    }
}

let ODDS = {}

const setTabOdds = (game) => {
    let openHome = game[0]['odds'][0]['open']
    let openDraw = game[0]['odds'][1]['open']
    let openAway = game[0]['odds'][2]['open']

    let lastHome = game[0]['odds'][0]['last']
    let lastDraw = game[0]['odds'][1]['last']
    let lastAway = game[0]['odds'][2]['last']

    let tabOdds = new Table()

    tabOdds.setRow(['Open', openHome, openDraw, openAway])
    tabOdds.setRow(['Last', lastHome, lastDraw, lastAway])

    let dropHome = Odds.drop(lastHome, openHome).round(1)
    let dropDraw = Odds.drop(lastDraw, openDraw).round(1)
    let dropAway = Odds.drop(lastAway, openAway).round(1)

    let rowOddsDrop = tabOdds.setRow(['Drop', dropHome, dropDraw, dropAway])

    dropHome < 0 ? rowOddsDrop.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowOddsDrop.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropDraw < 0 ? rowOddsDrop.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowOddsDrop.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropAway < 0 ? rowOddsDrop.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowOddsDrop.getCells(3).setAttributes('style', "color: "+greenHexa+";")

    rowOddsDrop.setAttributes('class', 'fw-bold')
    tabOdds.setHead(['Odds', 'Home', 'Draw', 'Away'])
    tabOdds.setAttributes('class', 'table')
    tabOdds.draw(tablePredictions)

    ODDS = {openHome, openDraw, openAway, lastHome, lastDraw, lastAway}
    return ODDS
}

const setTabGame = (data, node) => {
    const tabGame = new Table()

    const PERIODE = 10

    console.log(data['data']['emaHome']);
    console.log(data['data']['emaHome'][PERIODE]);

    const tabEmaHome = data['data']['emaHome'][PERIODE]
    const tabEmaAway = data['data']['emaAway'][PERIODE]
    
    const emaHomeFor = tabEmaHome['emaFor']
    const emaHomeAga = tabEmaHome['emaAga']

    const norHomeFor = tabEmaHome['norFor']
    const norHomeAga = tabEmaHome['norAga']

    const emaAwayFor = tabEmaAway['emaFor']
    const emaAwayAga = tabEmaAway['emaAga']

    const norAwayFor = tabEmaAway['norFor']
    const norAwayAga = tabEmaAway['norAga']

    
    const potHomeFor = Poisson.getProba(emaHomeFor, 1/emaAwayAga, 25) // home => home
    const potHomeAga = Poisson.getProba(1/emaHomeAga, emaAwayFor, 25)

    const potAwayFor = Poisson.getProba(1/emaHomeAga, emaAwayFor, 25) // away => away
    const potAwayAga = Poisson.getProba(emaHomeFor, 1/emaAwayAga, 25)

    const tabPotHome = [potHomeFor['home'], potHomeAga['home']]
    const tabPotDraw = [potHomeFor['draw'], potHomeAga['draw']]
    const tabPotAway = [potHomeFor['away'], potHomeAga['away']]

    const maxPotHome = tabPotHome.max()
    const maxPotDraw = tabPotDraw.max()
    const maxPotAway = tabPotAway.max()

    const oddsMaxPotHome = Odds.proToOdds(maxPotHome)
    const oddsMaxPotDraw = Odds.proToOdds(maxPotDraw)
    const oddsMaxPotAway = Odds.proToOdds(maxPotAway)

    const riseOddsOpenHome = Odds.drop(ODDS['openHome'], oddsMaxPotHome)
    const riseOddsOpenDraw = Odds.drop(ODDS['openDraw'], oddsMaxPotDraw)
    const riseOddsOpenAway = Odds.drop(ODDS['openAway'], oddsMaxPotAway)

    const minPotHome = tabPotHome.min()
    const minPotDraw = tabPotDraw.min()
    const minPotAway = tabPotAway.min()

    const oddsMinPotHome = Odds.proToOdds(minPotHome)
    const oddsMinPotDraw = Odds.proToOdds(minPotDraw)
    const oddsMinPotAway = Odds.proToOdds(minPotAway)

    const dropOddsOpenHome = Odds.drop(ODDS['openHome'], oddsMinPotHome)
    const dropOddsOpenDraw = Odds.drop(ODDS['openDraw'], oddsMinPotDraw)
    const dropOddsOpenAway = Odds.drop(ODDS['openAway'], oddsMinPotAway)

    tabGame.setRow([
        `POV Potential home ${PERIODE}`,
        (potHomeFor['home'] * 100).round(2),
        (potHomeFor['draw'] * 100).round(2),
        (potHomeFor['away'] * 100).round(2),
    ])

    tabGame.setRow([
        `POV Potential away ${PERIODE}`,
        (potHomeAga['home'] * 100).round(2),
        (potHomeAga['draw'] * 100).round(2),
        (potHomeAga['away'] * 100).round(2),
    ])
    
    tabGame.setRow([
        `Max Potential ${PERIODE}`,
        (maxPotHome * 100).round(2),
        (maxPotDraw * 100).round(2),
        (maxPotAway * 100).round(2),
    ])

    tabGame.setRow([
        `Odds max Potential ${PERIODE}`,
        oddsMaxPotHome.round(2),
        oddsMaxPotDraw.round(2),
        oddsMaxPotAway.round(2),
    ])

    const rowRise = tabGame.setRow([
        `Rise Max -> Open ${PERIODE}`,
        riseOddsOpenHome.round(2),
        riseOddsOpenDraw.round(2),
        riseOddsOpenAway.round(2),
    ]).setAttributes('class', 'fw-bold')

    riseOddsOpenHome < 0 ? rowRise.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowRise.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    riseOddsOpenDraw < 0 ? rowRise.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowRise.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    riseOddsOpenAway < 0 ? rowRise.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowRise.getCells(3).setAttributes('style', "color: "+greenHexa+";")

    const rowDrop = tabGame.setRow([
        `Drop Max -> Open ${PERIODE}`,
        dropOddsOpenHome.round(2),
        dropOddsOpenDraw.round(2),
        dropOddsOpenAway.round(2),
    ]).setAttributes('class', 'fw-bold')

    dropOddsOpenHome < 0 ? rowDrop.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowDrop.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropOddsOpenDraw < 0 ? rowDrop.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowDrop.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropOddsOpenAway < 0 ? rowDrop.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowDrop.getCells(3).setAttributes('style', "color: "+greenHexa+";")

    tabGame.setHead(['Type', 'Home', 'Draw', 'Away'])
    tabGame.setAttributes('class', 'table table-striped')
    tabGame.draw(node)
}

const setTabTeam = (id, node) => {
    let tabInfos = new Table()
    let res = {}
    const PERIODE = [10, 3]

    for (const indexPeriode in PERIODE) {
        let laPeriode = PERIODE[indexPeriode]
        let tabTmp = [...datasGame[id]['games']]
        if (typeof laPeriode !== 'function') {
            tabTmp = [...tabTmp].reverse().slice(-laPeriode)
            console.log(tabTmp);
            let xgFor = []
            let xgAga = []
    
            for (let i = 0; i < tabTmp.length; i++) {
                const gameStat = datasGame[id]['games'][i];
                const game = gameStat['game']
                const statistics = gameStat['statistics']

                xgFor.push(statistics['xgFor'])
                xgAga.push(statistics['xgAga'])
            }
    
            const emaFor = ToolsAverage.ema(xgFor, laPeriode-1)
            const emaAga = ToolsAverage.ema(xgAga, laPeriode-1)
    
            const norFor = xgFor.average()
            const norAga = xgAga.average()
    
            tabInfos.setRow([
                `EMA ${laPeriode}`,
                emaFor.round(2),
                emaAga.round(2),
                (emaFor / emaAga).round(2)
            ])
    
            
            res = {...res, [laPeriode]: {emaFor, emaAga, norFor, norAga}}
        }
    }

    tabInfos.setHead(['Type', 'For', 'Against'])
    tabInfos.setAttributes('class', 'table')
    tabInfos.draw(node)
    console.log(res);
    return res
}

const setTabOpponent = (id, node) => {
    let tabHistoric = new Table()

    let tabTmp = datasGame[id]['games'].reverse().slice(-10)

    for (let i = 0; i < tabTmp.length; i++) {
        const gameStat = datasGame[id]['games'][i];
        const game = gameStat['game']
        const statistics = gameStat['statistics']
        let opponent
        let result
        let xgTeam
        if (game['homeTeam']['id'] === id) {
            xgAga = game['xg']['away']
            xgFor = game['xg']['home']
            opponent = game['awayTeam']['name']
            result = game['homeScore']['final'] - game['awayScore']['final']
        } else {
            xgAga = game['xg']['home']
            xgFor = game['xg']['away']
            opponent = game['homeTeam']['name']
            result = game['awayScore']['final'] - game['homeScore']['final']
        }
        let { nbShot, avgShotXg } = statistics

        tabHistoric.setRow([
            `J - ${i+1}`,
            opponent,
            result,
            nbShot,
            xgFor.round(2),
            xgAga.round(2)
        ])
    }

    tabHistoric.setHead(['Jour', 'Opp.', 'Result', 'Shots', 'For', 'Against'])
    tabHistoric.setAttributes('class', 'table')
    tabHistoric.draw(node)
}


const init = async () => {
    const game = await Fetch.get('/api/football-statistics/games-by-id/' + gameId)
    const date = moment.unix(game[0]['startTime'])
    const gamesHome = await Fetch.get('/api/football-statistics/games-by-team/' + homeId)
    const gamesAway = await Fetch.get('/api/football-statistics/games-by-team/' + awayId)
    const actualHomeXg = await Fetch.get('/api/football-statistics/xg-actual-by-team/' + homeId + '/' + moment(date).format('YYYY-MM-DD'))
    const actualAwayXg = await Fetch.get('/api/football-statistics/xg-actual-by-team/' + awayId + '/' + moment(date).format('YYYY-MM-DD'))
    const xgBetweenHome = await Fetch.get('/api/football-statistics/xg-between-goal-team/' + homeId)
    const xgBetweenAway = await Fetch.get('/api/football-statistics/xg-between-goal-team/' + awayId)
    const gamesH2H = await Fetch.get('/api/football-statistics/games-H2H/'+homeId+'/'+awayId)

    console.log(game);
    console.log(gamesHome);

    let {openHome, openDraw, openAway, lastHome, lastDraw, lastAway} = setTabOdds(game)

    const verifDate = (game) => {
        const dateGame = moment.unix(game['startTime'])
        console.log(dateGame.format('lll'));
        if (moment(dateGame).isBefore(date) && game['status'] === "finished") {
            return game
        } else {
            return false
        }
    }

    const traitementDatasGame = (fixture, id) => {
        let game = verifDate(fixture)
        let tabShotXg = []

        const valideDatasEvent = (event) => {
            if (event['teamId'] === id && event['xg'] !== null) {
                tabShotXg.push(event['xg'])
            }
        }

        if (game) {
            if (game['homeTeam']['id'] === id) {
                let events = game['events']
                events.forEach(valideDatasEvent)
                let nbShot = tabShotXg.length
                let avgShotXg = tabShotXg.average()
                
                let xgFor = game['xg']['home']
                let xgAga = game['xg']['away']
                
                let statistics = {nbShot, avgShotXg, xgFor, xgAga}
                datasGame[id]['games'].push({game, statistics})
            }  
            if (game['awayTeam']['id'] === id) {
                let events = game['events']
                events.forEach(valideDatasEvent)
                let nbShot = tabShotXg.length
                let avgShotXg = tabShotXg.average()

                let xgFor = game['xg']['away']
                let xgAga = game['xg']['home']

                let statistics = {nbShot, avgShotXg, xgFor, xgAga}
                datasGame[id]['games'].push({game, statistics})
            }
           
        }
    }

    const traitementDatasGameHome = (fixture) => {
        traitementDatasGame(fixture, homeId)
    }

    const traitementDatasGameAway = (fixture) => {
        traitementDatasGame(fixture, awayId)
    }

    gamesHome.forEach(traitementDatasGameHome)
    gamesAway.forEach(traitementDatasGameAway)

    setTabOpponent(homeId, tableHomeOpponent)
    setTabOpponent(awayId, tableAwayOpponent)

    const emaHome = setTabTeam(homeId, tableHome)
    const emaAway = setTabTeam(awayId, tableAway)

    data = {emaHome, emaAway}

    setTabGame({data}, tableGame)
}

init()