let graphGame = document.getElementById('graphGame')
let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tablePredictions = document.getElementById('tablePredictions')

let gameId = parseInt(graphGame.getAttribute('data'))
let homeId = parseInt(graphHome.getAttribute('data'))
let awayId = parseInt(graphAway.getAttribute('data'))

let redHexa = '#D53636'
let greenHexa = '#4CAA1B'

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
    const gamesH2H = await Fetch.get('/api/football-statistics/games-H2H/'+homeId+'/'+awayId)

    console.log(gamesH2H);

    console.log(game);




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

    const EMA_BETWEEN = 90
    const EMA_GAMES = 10
    //const EMA_GAMES_TAB = [3, 5, 15, 30, 90, 120, 150, 200]
    const EMA_GAMES_TAB = [3, 5]

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
                
                    if (game['xg']['home'] / game['xg']['away'] < 100) {
                        //console.log(game);
                        tabHistHome.push(game['xg']['home'] / game['xg']['away'])
                    }
                } else {
     
                    if (game['xg']['away'] / game['xg']['home'] < 100) {
                        //console.log(game);
                        tabHistHome.push(game['xg']['away'] / game['xg']['home'])
                    }
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
             
                    if (game['xg']['home'] / game['xg']['away'] < 100) {
                        //console.log(game);
                        tabHistAway.push(game['xg']['home'] / game['xg']['away'])
                    }
                } else {
            
                    if (game['xg']['away'] / game['xg']['home'] < 100) {
                        //console.log(game);
                        tabHistAway.push(game['xg']['away'] / game['xg']['home'])
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    let tabEmaHisto = []
    //let tabOpenEmaDrop = []
    let tabOpenEmaDrop = new Table()
    let tabLastEmaDrop = new Table()
    let tabProbGame = new Table()
    let tabOpenAddEmaDrop = new Table()
    let oddsEma = []
    let tabEmaHome = []
    let tabEmaAway = []

    for (let i = 0; i < EMA_GAMES_TAB.length; i++) {
        try {
            let periode = EMA_GAMES_TAB[i]
            //let emaHome = ToolsAverage.ema(tabHistHome, periode)
            //let emaAway = ToolsAverage.ema(tabHistAway, periode)
            let emaHome = tabHistHome.slice(-periode).average()
            let emaAway = tabHistAway.slice(-periode).average()

            
            tabEmaHisto.push([
                `${periode}`,
                emaHome.round(2),
                emaAway.round(2)
            ])

            let prob = Poisson.getProba(emaHome, emaAway, 25)

            tabProbGame.setRow([
                `${periode}`,
                (prob['home']*100).round(1),
                (prob['draw']*100).round(1),
                (prob['away']*100).round(1)
            ])

            let oddsHome = Odds.proToOdds(prob['home'])
            let oddsDraw = Odds.proToOdds(prob['draw'])
            let oddsAway = Odds.proToOdds(prob['away'])

            oddsEma.push([oddsHome, oddsDraw, oddsAway])

            let openDropHome = Odds.drop(openHome, oddsHome)
            let openDropDraw = Odds.drop(openDraw, oddsDraw)
            let openDropAway = Odds.drop(openAway, oddsAway)

            let rowOpenEmaDrop = tabOpenEmaDrop.setRow([
                `${periode}`,
                openDropHome.round(2),
                openDropDraw.round(2),
                openDropAway.round(2)
            ])

            openDropHome < 0 ? rowOpenEmaDrop.getCells(1).setAttributes("style", "color: "+redHexa+";") : rowOpenEmaDrop.getCells(1).setAttributes("style", "color: "+greenHexa+";")
            openDropDraw < 0 ? rowOpenEmaDrop.getCells(2).setAttributes("style", "color: "+redHexa+";") : rowOpenEmaDrop.getCells(2).setAttributes("style", "color: "+greenHexa+";")
            openDropAway < 0 ? rowOpenEmaDrop.getCells(3).setAttributes("style", "color: "+redHexa+";") : rowOpenEmaDrop.getCells(3).setAttributes("style", "color: "+greenHexa+";")

            rowOpenEmaDrop.setAttributes('class', 'fw-bold')




            let PERCENT = [0.3, 0.5, 1]

            let rowOpenAddEmaDrop = tabOpenAddEmaDrop.setRow([
                'Periode',
                `${periode}`,
                '',
                ''
            ])

            rowOpenAddEmaDrop.getCells(1).setAttributes('colspan', '3')
            rowOpenAddEmaDrop.getCells(1).setAttributes('class', 'fw-bold text-center')

            PERCENT.forEach(per => {
                let openAddHome = Odds.oddsAddPro(openHome, per)
                let openAddDraw = Odds.oddsAddPro(openDraw, per)
                let openAddAway = Odds.oddsAddPro(openAway, per)
    
                let openAddDropHome = Odds.drop(openAddHome, oddsHome)
                let openAddDropDraw = Odds.drop(openAddDraw, oddsDraw)
                let openAddDropAway = Odds.drop(openAddAway, oddsAway)
    
          
    
                let rowOpenAddEmaDrop = tabOpenAddEmaDrop.setRow([
                    `${'+'+ (per * 100).round() +'%'}`,
                    openAddDropHome.round(2),
                    openAddDropDraw.round(2),
                    openAddDropAway.round(2)
                ])
    
                openAddDropHome < 0 ? rowOpenAddEmaDrop.getCells(1).setAttributes("style", "color: "+redHexa+";") : rowOpenAddEmaDrop.getCells(1).setAttributes("style", "color: "+greenHexa+";")
                openAddDropDraw < 0 ? rowOpenAddEmaDrop.getCells(2).setAttributes("style", "color: "+redHexa+";") : rowOpenAddEmaDrop.getCells(2).setAttributes("style", "color: "+greenHexa+";")
                openAddDropAway < 0 ? rowOpenAddEmaDrop.getCells(3).setAttributes("style", "color: "+redHexa+";") : rowOpenAddEmaDrop.getCells(3).setAttributes("style", "color: "+greenHexa+";")
    
                rowOpenAddEmaDrop.setAttributes('class', 'fw-bold')
            })

           


            let lastDropHome = Odds.drop(lastHome, oddsHome)
            let lastDropDraw = Odds.drop(lastDraw, oddsDraw)
            let lastDropAway = Odds.drop(lastAway, oddsAway)

            let rowLastEmaDrop = tabLastEmaDrop.setRow([
                `${periode}`,
                lastDropHome.round(2),
                lastDropDraw.round(2),
                lastDropAway.round(2)
            ])

            lastDropHome < 0 ? rowLastEmaDrop.getCells(1).setAttributes("style", "color: "+redHexa+";") : rowLastEmaDrop.getCells(1).setAttributes("style", "color: "+greenHexa+";")
            lastDropDraw < 0 ? rowLastEmaDrop.getCells(2).setAttributes("style", "color: "+redHexa+";") : rowLastEmaDrop.getCells(2).setAttributes("style", "color: "+greenHexa+";")
            lastDropAway < 0 ? rowLastEmaDrop.getCells(3).setAttributes("style", "color: "+redHexa+";") : rowLastEmaDrop.getCells(3).setAttributes("style", "color: "+greenHexa+";")
            
            rowLastEmaDrop.setAttributes('class', 'fw-bold')
        } catch (e) {
            console.log(e);
        }
    }

   


    let probDropHome = Odds.drop(oddsEma[0][0], oddsEma[1][0]).round(2)
    let probDropDraw = Odds.drop(oddsEma[0][1], oddsEma[1][1]).round(2)
    let probDropAway = Odds.drop(oddsEma[0][2], oddsEma[1][2]).round(2)

    let rowProbDrop = tabProbGame.setRow([
        'Drop.',
        probDropHome,
        probDropDraw,
        probDropAway
    ])

    probDropHome < 0 ? rowProbDrop.getCells(1).setAttributes("style", "color: "+redHexa+";") : rowProbDrop.getCells(1).setAttributes("style", "color: "+greenHexa+";")
    probDropDraw < 0 ? rowProbDrop.getCells(2).setAttributes("style", "color: "+redHexa+";") : rowProbDrop.getCells(2).setAttributes("style", "color: "+greenHexa+";")
    probDropAway < 0 ? rowProbDrop.getCells(3).setAttributes("style", "color: "+redHexa+";") : rowProbDrop.getCells(3).setAttributes("style", "color: "+greenHexa+";")

    rowProbDrop.setAttributes('class', 'fw-bold')
    tabProbGame.setHead(['Xg probability', 'Home', 'Draw', 'Away'])
    tabProbGame.setAttributes('class', 'table')
    //tabProbGame.draw(tablePredictions)

    const tablastMaxMin = [-1, -3, -4, -5]

    tablastMaxMin.forEach(lastMaxMin => {
        /*let xgMaxHome = tabHistHome.slice(lastMaxMin).max()
        let xgMaxAway = tabHistAway.slice(lastMaxMin).max()
    
        let xgMinHome = tabHistHome.slice(lastMaxMin).min()
        let xgMinAway = tabHistAway.slice(lastMaxMin).min()
    
        let poissonMax = Poisson.getProba(xgMaxHome, xgMaxAway, 100)
        let poissonMin = Poisson.getProba(xgMinHome, xgMinAway, 25)
    
        let oddsMaxHome = Odds.proToOdds(poissonMax['home'])
        let oddsMaxDraw = Odds.proToOdds(poissonMax['draw'])
        let oddsMaxAway = Odds.proToOdds(poissonMax['away'])
    
        let oddsMinHome = Odds.proToOdds(poissonMin['home'])
        let oddsMinDraw = Odds.proToOdds(poissonMin['draw'])
        let oddsMinAway = Odds.proToOdds(poissonMin['away'])
    
        let dropOpenMaxHome = Odds.drop(openHome, oddsMaxHome)
        let dropOpenMaxDraw = Odds.drop(openDraw, oddsMaxDraw)
        let dropOpenMaxAway = Odds.drop(openAway, oddsMaxAway)
    
        let dropOpenMinHome = Odds.drop(openHome, oddsMinHome)
        let dropOpenMinDraw = Odds.drop(openDraw, oddsMinDraw)
        let dropOpenMinAway = Odds.drop(openAway, oddsMinAway)
    
        let rowMax = tabOpenEmaDrop.setRow([
            `Max ${lastMaxMin}`,
            dropOpenMaxHome.round(),
            dropOpenMaxDraw.round(),
            dropOpenMaxAway.round()
        ])
    
        dropOpenMaxHome < 0 ? rowMax.getCells(1).setAttributes("style", "color: "+redHexa+";") : rowMax.getCells(1).setAttributes("style", "color: "+greenHexa+";")
        dropOpenMaxDraw < 0 ? rowMax.getCells(2).setAttributes("style", "color: "+redHexa+";") : rowMax.getCells(2).setAttributes("style", "color: "+greenHexa+";")
        dropOpenMaxAway < 0 ? rowMax.getCells(3).setAttributes("style", "color: "+redHexa+";") : rowMax.getCells(3).setAttributes("style", "color: "+greenHexa+";")
        rowMax.setAttributes('class', 'fw-bold')
        
        let rowMin = tabOpenEmaDrop.setRow([
            `Min ${lastMaxMin}`,
            dropOpenMinHome.round(),
            dropOpenMinDraw.round(),
            dropOpenMinAway.round()
        ])
    
        dropOpenMinHome < 0 ? rowMin.getCells(1).setAttributes("style", "color: "+redHexa+";") : rowMin.getCells(1).setAttributes("style", "color: "+greenHexa+";")
        dropOpenMinDraw < 0 ? rowMin.getCells(2).setAttributes("style", "color: "+redHexa+";") : rowMin.getCells(2).setAttributes("style", "color: "+greenHexa+";")
        dropOpenMinAway < 0 ? rowMin.getCells(3).setAttributes("style", "color: "+redHexa+";") : rowMin.getCells(3).setAttributes("style", "color: "+greenHexa+";")
        rowMin.setAttributes('class', 'fw-bold')*/
    
    })
    
    

    tabOpenEmaDrop.setHead(['Open drop', 'Home', 'Draw', 'Away'])
    tabOpenEmaDrop.setAttributes('class', 'table')
    tabOpenEmaDrop.draw(tablePredictions)
    

    let headOpenAddEmaDrop = tabOpenAddEmaDrop.setHead(['Open drop', 'Home', 'Draw', 'Away'])

    headOpenAddEmaDrop.setAttributes('onclick', 'handleView()')
    tabOpenAddEmaDrop.setAttributesBody('id', 'openAddEmaDrop')
    tabOpenAddEmaDrop.setAttributesBody('style', 'display: none;')
    tabOpenAddEmaDrop.setAttributes('class', 'table')
    tabOpenAddEmaDrop.draw(tablePredictions)
    

    tabLastEmaDrop.setHead(['Last drop', 'Home', 'Draw', 'Away'])
    tabLastEmaDrop.setAttributes('class', 'table')
    tabLastEmaDrop.draw(tablePredictions)


    const AVG_GAME = 90

    tabEmaHisto.push([
        `Avg ${AVG_GAME}`,
        tabHistHome.slice(-AVG_GAME).average().round(2),
        tabHistAway.slice(-AVG_GAME).average().round(2)
    ])

    createTable(
        ['Average xg', 'Home', 'Away'],
        tabEmaHisto,
        tablePredictions
    )


  

    /*tabEmaHisto.push([
        'Max',
        tabHistHome.slice(-4).max().round(2),
        tabHistAway.slice(-4).max().round(2)
    ])

    tabEmaHisto.push([
        'Min',
        tabHistHome.slice(-4).min().round(2),
        tabHistAway.slice(-4).min().round(2)
    ])*/

    



    /*createTable(
        ['Type', 'EMA', 'Home', 'Away'],
        [
            ['Between', `${EMA_BETWEEN}`, ema_XgBH.round(), ema_XgBA.round()],
            ['Actual', '', actualHomeXg[0]['xg'].round(), actualAwayXg[0]['xg'].round()]
        ],
        tablePredictions
    )*/

    const MAX_GAMES = 10
    let tabDropHisto = new Table()

    for(let i = 1; i <= MAX_GAMES; i++) {
        let tmpXgHome = tabHistHome[tabHistHome.length-i];
        let tmpXgAway = tabHistAway[tabHistAway.length-i];

        let tmpPoisson = Poisson.getProba(tmpXgHome, tmpXgAway, 100)

        let tmpOddsHome = Odds.proToOdds(tmpPoisson['home'])
        let tmpOddsDraw = Odds.proToOdds(tmpPoisson['draw'])
        let tmpOddsAway = Odds.proToOdds(tmpPoisson['away'])

        let tmpDropHome = Odds.drop(openHome, tmpOddsHome)
        let tmpDropDraw = Odds.drop(openDraw, tmpOddsDraw)
        let tmpDropAway = Odds.drop(openAway, tmpOddsAway)

        let rowDropHisto = tabDropHisto.setRow([
            `J - ${i}`,
            tmpDropHome.round(1),
            tmpDropDraw.round(1),
            tmpDropAway.round(1),
        ])

        tmpDropHome < 0 ? rowDropHisto.getCells(1).setAttributes("style", "color: "+redHexa+";") : rowDropHisto.getCells(1).setAttributes("style", "color: "+greenHexa+";")
        tmpDropDraw < 0 ? rowDropHisto.getCells(2).setAttributes("style", "color: "+redHexa+";") : rowDropHisto.getCells(2).setAttributes("style", "color: "+greenHexa+";")
        tmpDropAway < 0 ? rowDropHisto.getCells(3).setAttributes("style", "color: "+redHexa+";") : rowDropHisto.getCells(3).setAttributes("style", "color: "+greenHexa+";")
        rowDropHisto.setAttributes('class', 'fw-bold')
    }

    tabDropHisto.setHead(['Jour', 'Home', 'Draw', 'Away'])
    tabDropHisto.setAttributes('class', 'table')
    tabDropHisto.draw(tablePredictions)

}

function handleView() {
    let node = document.getElementById('openAddEmaDrop')
    let style = node.getAttribute('style')
    if (style === null) {
        node.setAttribute('style', 'display: none;')
    } else if (style === '') {
        node.setAttribute('style', 'display: none;')
    } else {
        node.setAttribute('style', '')
    }
}

init()