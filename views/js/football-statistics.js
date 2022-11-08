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

    const poiEmaFor = Poisson.getProba(emaHomeFor, emaAwayFor, 25)
    const poiEmaAga = Poisson.getProba(emaHomeAga, emaAwayAga, 25)

    const poiNorFor = Poisson.getProba(norHomeFor, norAwayFor, 25)
    const poiNorAga = Poisson.getProba(norHomeAga, norAwayAga, 25)

    const oddsEmaForHome = Odds.proToOdds(poiEmaFor['home'])
    const oddsEmaForDraw = Odds.proToOdds(poiEmaFor['draw'])
    const oddsEmaForAway = Odds.proToOdds(poiEmaFor['away'])

    const oddsNorForHome = Odds.proToOdds(poiNorFor['home'])
    const oddsNorForDraw = Odds.proToOdds(poiNorFor['draw'])
    const oddsNorForAway = Odds.proToOdds(poiNorFor['away'])    

    const dropForHome = Odds.drop(oddsNorForHome, oddsEmaForHome)
    const dropForDraw = Odds.drop(oddsNorForDraw, oddsEmaForDraw)
    const dropForAway = Odds.drop(oddsNorForAway, oddsEmaForAway)

    const dropOpenEmaForHome = Odds.drop(oddsNorForHome, ODDS['openHome'])
    const dropOpenEmaForDraw = Odds.drop(oddsNorForDraw, ODDS['openDraw'])
    const dropOpenEmaForAway = Odds.drop(oddsNorForAway, ODDS['openAway'])

    const oddsEmaAgaHome = Odds.proToOdds(poiEmaAga['home'])
    const oddsEmaAgaDraw = Odds.proToOdds(poiEmaAga['draw'])
    const oddsEmaAgaAway = Odds.proToOdds(poiEmaAga['away'])

    const oddsNorAgaHome = Odds.proToOdds(poiNorAga['home'])
    const oddsNorAgaDraw = Odds.proToOdds(poiNorAga['draw'])
    const oddsNorAgaAway = Odds.proToOdds(poiNorAga['away']) 

    const dropAgaHome = Odds.drop(oddsNorAgaHome, oddsEmaAgaHome)
    const dropAgaDraw = Odds.drop(oddsNorAgaDraw, oddsEmaAgaDraw)
    const dropAgaAway = Odds.drop(oddsNorAgaAway, oddsEmaAgaAway)

    const dropOpenEmaAgaHome = Odds.drop(oddsNorAgaHome, ODDS['openHome'])
    const dropOpenEmaAgaDraw = Odds.drop(oddsNorAgaDraw, ODDS['openDraw'])
    const dropOpenEmaAgaAway = Odds.drop(oddsNorAgaAway, ODDS['openAway'])

    
    {emaHomeFor, emaHomeAga, emaAwayFor, emaAwayAga}

    const poiHomeFor = Poisson.getProba(emaHomeFor, emaAwayAga, 25)
    const poiHomeAga = Poisson.getProba(emaHomeAga, emaAwayFor, 25)

    const oddsPoiHForHome = Odds.proToOdds(poiHomeFor['home'])
    const oddsPoiHForDraw = Odds.proToOdds(poiHomeFor['draw'])
    const oddsPoiHForAway = Odds.proToOdds(poiHomeFor['away'])

    const oddsPoiHAgaHome = Odds.proToOdds(poiHomeAga['home'])
    const oddsPoiHAgaDraw = Odds.proToOdds(poiHomeAga['draw'])
    const oddsPoiHAgaAway = Odds.proToOdds(poiHomeAga['away'])

    const dropPovHomeFF = Odds.drop(oddsPoiHAgaAway, oddsPoiHForHome)
    const dropPovHomeMM = Odds.drop(oddsPoiHAgaDraw, oddsPoiHForDraw)
    const dropPovHomeAA = Odds.drop(oddsPoiHAgaHome, oddsPoiHForAway)

    const dropPovAwayAA = Odds.drop(oddsPoiHForAway, oddsPoiHAgaHome)
    const dropPovAwayMM = Odds.drop(oddsPoiHForDraw, oddsPoiHAgaDraw)
    const dropPovAwayFF = Odds.drop(oddsPoiHForHome, oddsPoiHAgaAway)

    console.log(oddsPoiHForHome);
    console.log(oddsPoiHAgaAway);

    console.log(oddsPoiHForDraw);
    console.log(oddsPoiHAgaDraw);

    console.log(oddsPoiHForAway);
    console.log(oddsPoiHAgaHome);



    const rowPovHome = tabGame.setRow([
        `POV HOME ${PERIODE}`,
        dropPovHomeFF.round(1),
        dropPovHomeMM.round(1),
        dropPovHomeAA.round(1),
    ]).setAttributes('class', 'fw-bold')

    dropPovHomeFF < 0 ? rowPovHome.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowPovHome.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropPovHomeMM < 0 ? rowPovHome.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowPovHome.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropPovHomeAA < 0 ? rowPovHome.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowPovHome.getCells(3).setAttributes('style', "color: "+greenHexa+";")

    const rowPovAway = tabGame.setRow([
        `POV AWAY ${PERIODE}`,
        dropPovAwayAA.round(1),
        dropPovAwayMM.round(1),
        dropPovAwayFF.round(1),
    ]).setAttributes('class', 'fw-bold')

    dropPovAwayAA < 0 ? rowPovAway.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowPovAway.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropPovAwayMM < 0 ? rowPovAway.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowPovAway.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropPovAwayFF < 0 ? rowPovAway.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowPovAway.getCells(3).setAttributes('style', "color: "+greenHexa+";")

    /** */


    tabGame.setRow([
        `HOME FOR ${PERIODE}`,
        (poiHomeFor['home'] * 100).round(1),
        (poiHomeFor['draw'] * 100).round(1),
        (poiHomeFor['away'] * 100).round(1)
    ])

    tabGame.setRow([
        `HOME AGAINST ${PERIODE}`,
        (poiHomeAga['home'] * 100).round(1),
        (poiHomeAga['draw'] * 100).round(1),
        (poiHomeAga['away'] * 100).round(1)
    ])

    

    const rowEma = tabGame.setRow([
        'TYPE',
        'EMA',
        '',
        ''
    ])

    rowEma.getCells(1).setAttributes("colspan", "2")
    rowEma.getCells(1).setAttributes("class", "text-center fw-bold")

    tabGame.setRow([
        `FOR ${PERIODE}`,
        (poiEmaFor['home'] * 100).round(1),
        (poiEmaFor['draw'] * 100).round(1),
        (poiEmaFor['away'] * 100).round(1)
    ])
    tabGame.setRow([
        `AGAINST ${PERIODE}`,
        (poiEmaAga['home'] * 100).round(1),
        (poiEmaAga['draw'] * 100).round(1),
        (poiEmaAga['away'] * 100).round(1)
    ])


    const rowNor = tabGame.setRow([
        'TYPE',
        'NORMAL AVG',
        '',
        ''
    ])

    rowNor.getCells(1).setAttributes("colspan", "2")
    rowNor.getCells(1).setAttributes("class", "text-center fw-bold")

    tabGame.setRow([
        `FOR ${PERIODE}`,
        (poiNorFor['home'] * 100).round(1),
        (poiNorFor['draw'] * 100).round(1),
        (poiNorFor['away'] * 100).round(1)
    ])

    tabGame.setRow([
        `AGAINST ${PERIODE}`,
        (poiNorAga['home'] * 100).round(1),
        (poiNorAga['draw'] * 100).round(1),
        (poiNorAga['away'] * 100).round(1)
    ])

    tabGame.setRow([
        'TYPE',
        'DROP',
        '',
        ''
    ])
    .getCells('DROP')
    .setAttributes("colspan", "2")
    .setAttributes("class", "text-center fw-bold")

    const rowDropFor = tabGame.setRow([
        `FOR ${PERIODE}`,
        dropForHome.round(2),
        dropForDraw.round(2),
        dropForAway.round(2),
    ]).setAttributes('class', 'fw-bold')

    const rowDropAga = tabGame.setRow([
        `AGAINST ${PERIODE}`,
        dropAgaHome.round(2),
        dropAgaDraw.round(2),
        dropAgaAway.round(2),
    ]).setAttributes('class', 'fw-bold')

    dropForHome < 0 ? rowDropFor.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowDropFor.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropForDraw < 0 ? rowDropFor.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowDropFor.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropForAway < 0 ? rowDropFor.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowDropFor.getCells(3).setAttributes('style', "color: "+greenHexa+";")

    dropAgaHome > 0 ? rowDropAga.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowDropAga.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropAgaDraw > 0 ? rowDropAga.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowDropAga.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropAgaAway > 0 ? rowDropAga.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowDropAga.getCells(3).setAttributes('style', "color: "+greenHexa+";")


    tabGame.setRow([
        'TYPE',
        'DROP NORMAL / OPEN',
        '',
        ''
    ])
    .getCells('DROP NORMAL / OPEN')
    .setAttributes("colspan", "2")
    .setAttributes("class", "text-center fw-bold")

    const rowDropOpenEmaFor = tabGame.setRow([
        `FOR ${PERIODE}`,
        dropOpenEmaForHome.round(2),
        dropOpenEmaForDraw.round(2),
        dropOpenEmaForAway.round(2),
    ])

    const rowDropOpenEmaAga = tabGame.setRow([
        `AGAINST ${PERIODE}`,
        dropOpenEmaAgaHome.round(2),
        dropOpenEmaAgaDraw.round(2),
        dropOpenEmaAgaAway.round(2),
    ])

    dropOpenEmaForHome < 0 ? rowDropOpenEmaFor.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowDropOpenEmaFor.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropOpenEmaForDraw < 0 ? rowDropOpenEmaFor.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowDropOpenEmaFor.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropOpenEmaForAway < 0 ? rowDropOpenEmaFor.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowDropOpenEmaFor.getCells(3).setAttributes('style', "color: "+greenHexa+";")

    dropOpenEmaAgaHome > 0 ? rowDropOpenEmaAga.getCells(1).setAttributes('style', "color: "+redHexa+";") : rowDropOpenEmaAga.getCells(1).setAttributes('style', "color: "+greenHexa+";")
    dropOpenEmaAgaDraw > 0 ? rowDropOpenEmaAga.getCells(2).setAttributes('style', "color: "+redHexa+";") : rowDropOpenEmaAga.getCells(2).setAttributes('style', "color: "+greenHexa+";")
    dropOpenEmaAgaAway > 0 ? rowDropOpenEmaAga.getCells(3).setAttributes('style', "color: "+redHexa+";") : rowDropOpenEmaAga.getCells(3).setAttributes('style', "color: "+greenHexa+";")


    tabGame.setRow([
       '',
       '',
       '',
       ''
    ])


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
        if (typeof laPeriode !== 'function') {
            let tabTmp = datasGame[id]['games'].reverse().slice(-laPeriode)
            let xgFor = []
            let xgAga = []
    
            for (let i = 0; i < tabTmp.length; i++) {
                const gameStat = datasGame[id]['games'][i];
                const game = gameStat['game']
                const statistics = gameStat['statistics']
    
                console.log(statistics);
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