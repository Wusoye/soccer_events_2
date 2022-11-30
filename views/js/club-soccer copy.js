let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tableHome = document.getElementById('tableHome')
let tableAway = document.getElementById('tableAway')
let tablePredictions = document.getElementById('tablePredictions')

let homeData = graphHome.getAttribute('data')
let awayData = graphAway.getAttribute('data')

const idGame = homeData.split(';')[0]
const team1 = homeData.split(';')[1]
const team2 = awayData.split(';')[1]

const PERIODE = 5
const PERIODE_BIS = 5

const SLICE = 10

let MARGIN = {
    top: 10,
    right: 30,
    bottom: 10,
    left: 13
}

let DISPLAY = {
    linkType: "bezier",
    linkWidth: "1",
    linkColor: "#FF0000",
    linkFromZero: false,
    linkDash: [],
    dataType: "rectangle",
    dataWidth: "4",
    dataColor: "#000"
}






fetch('http://127.0.0.1:8080/api/club-soccer/games-by-id/' + idGame)
    .then((response) => response.json())
    .then(async (dataGame) => {
        let xgHome = null
        let xgHomeBis = null
        await fetch('http://127.0.0.1:8080/api/club-soccer/ema-expected-goal-by-team/' + team1 + '/' + PERIODE)
            .then((response) => response.json())
            .then(async (emaHome) => {

                let dataExpGoa = []
                let dataEmaExpGoa = []
                let dataGoa = []
                let tabValues = []
                let index = 0

                for (const infos of emaHome) {
                    let tabValuesTmp = []
                    if (moment(dataGame['date']).isAfter(infos['date'], 'day')) {
                        //infos['ema']['our_value'] !== null ? dataEmaExpGoa.push([index, (infos['ema']['our_value'])]) : null
                        //infos['ema']['opponent_value'] !== null ? dataExpGoa.push([index, infos['ema']['opponent_value']]) : null
                        dataEmaExpGoa.push([index, infos['our_exp_goa']])
                        dataExpGoa.push([index, infos['opponent_exp_goa']])
                        dataGoa.push([index, infos['our_goals'] - infos['opp_goals']])

                        let _id = infos['_id']
                        let nameHisto = null

                        await fetch('http://127.0.0.1:8080/api/club-soccer/games-by-id/' + _id)
                            .then((response) => response.json())
                            .then(async (gameHisto) => {
                                
                                if (gameHisto['team1'] === team1) {
                                    nameHisto = gameHisto['team2']
                                    tabValuesTmp.push(gameHisto['team2'])
                                    if (gameHisto['score1'] > gameHisto['score2']) {
                                        tabValuesTmp.push('W')
                                    }
                                    if (gameHisto['score1'] == gameHisto['score2']) {
                                        tabValuesTmp.push('D')
                                    }
                                    if (gameHisto['score1'] < gameHisto['score2']) {
                                        tabValuesTmp.push('L')
                                    }
                                    tabValuesTmp.push(gameHisto['score1'] - gameHisto['score2'])
                                    tabValuesTmp.push(infos['ema']['our_value'] !== null ? (infos['ema']['our_value'] / infos['ema']['opponent_value']).round() : '')
                                    infos['ema']['our_value'] !== null ? xgHome = infos['ema']['our_value'] : null
                                    tabValuesTmp.push(infos['our_exp_goa'].round())
                                    //tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                    tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                } else
                                    if (gameHisto['team2'] === team1) {
                                        tabValuesTmp.push(gameHisto['team1'])
                                        if (gameHisto['score1'] < gameHisto['score2']) {
                                            tabValuesTmp.push('W')
                                        }
                                        if (gameHisto['score1'] == gameHisto['score2']) {
                                            tabValuesTmp.push('D')
                                        }
                                        if (gameHisto['score1'] > gameHisto['score2']) {
                                            tabValuesTmp.push('L')
                                        }
                                        tabValuesTmp.push(gameHisto['score2'] - gameHisto['score1'])
                                        tabValuesTmp.push(infos['ema']['our_value'] !== null ? (infos['ema']['our_value'] / infos['ema']['opponent_value']).round() : '')
                                        infos['ema']['our_value'] !== null ? xgHome = infos['ema']['our_value'] : null
                                        tabValuesTmp.push(infos['our_exp_goa'].round())
                                        //tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                        tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                    }

                            })
                        tabValues.push(tabValuesTmp)
                    }

                    index++
                }

                tabValues.reverse()

                createTable(
                    //Ema Exp Goa. => EEG
                    ['Name', 'Result', 'Score', 'EEG', 'Our', 'Opp.'],
                    tabValues,
                    tableHome
                )

                let dataEmaExpGoaBis = []


                await fetch('http://127.0.0.1:8080/api/club-soccer/ema-expected-goal-by-team/' + team1 + '/' + PERIODE_BIS)
                    .then((response) => response.json())
                    .then(async (emaHome) => {
                        let index = 0
                        for (const infos of emaHome) {

                            if (moment(dataGame['date']).isAfter(infos['date'], 'day')) {
                                infos['ema']['our_value'] !== null ? xgHomeBis = infos['ema']['our_value']  : null
                                //infos['ema']['our_value'] !== null ? dataEmaExpGoaBis.push([index, (infos['ema']['our_value'] / infos['ema']['opponent_value']).round()]) : null
                                index++
                            }
                        }

                    })

                 


                let graph = new jsGraphDisplay({
                    margin: MARGIN
                });

                var display = DISPLAY

                display.linkColor = "#1A39B9"

                graph.DataAdd({
                    data: dataExpGoa.slice(-SLICE),
                    display
                });

                display.linkColor = "#F7851B"

                graph.DataAdd({
                    data: dataEmaExpGoa.slice(-SLICE),
                    display
                });


                display.linkColor = "#F7251B"

                graph.DataAdd({
                    data: dataEmaExpGoaBis.slice(-SLICE),
                    display
                });


                display.linkColor = "#33CD31"

                graph.DataAdd({
                    data: dataGoa.slice(-SLICE),
                    display
                });

                graph.Draw('graphHome');

            })
            let xgAway = null
            let xgAwayBis = null
        await fetch('http://127.0.0.1:8080/api/club-soccer/ema-expected-goal-by-team/' + team2 + '/' + PERIODE)
            .then((response) => response.json())
            .then(async (emaAway) => {


                let dataExpGoa = []
                let dataEmaExpGoa = []
                let dataGoa = []
                let tabValues = []
                let index = 0

                for (const infos of emaAway) {
                    let tabValuesTmp = []
                    if (moment(dataGame['date']).isAfter(infos['date'], 'day')) {
                        //infos['ema']['our_value'] !== null ? dataEmaExpGoa.push([index, infos['ema']['our_value']]) : null
                        //infos['ema']['opponent_value'] !== null ? dataExpGoa.push([index, infos['ema']['opponent_value']]) : null
                        dataEmaExpGoa.push([index, infos['our_exp_goa']])
                        dataExpGoa.push([index, infos['opponent_exp_goa']])
                        dataGoa.push([index, infos['our_goals'] - infos['opp_goals']])

                        let _id = infos['_id']
                        let nameHisto = null

                        await fetch('http://127.0.0.1:8080/api/club-soccer/games-by-id/' + _id)
                            .then((response) => response.json())
                            .then(async (gameHisto) => {

                                if (gameHisto['team1'] === team2) {
                                    nameHisto = gameHisto['team2']
                                    tabValuesTmp.push(gameHisto['team2'])
                                    if (gameHisto['score1'] > gameHisto['score2']) {
                                        tabValuesTmp.push('W')
                                    }
                                    if (gameHisto['score1'] == gameHisto['score2']) {
                                        tabValuesTmp.push('D')
                                    }
                                    if (gameHisto['score1'] < gameHisto['score2']) {
                                        tabValuesTmp.push('L')
                                    }
                                    tabValuesTmp.push(gameHisto['score1'] - gameHisto['score2'])
                                    tabValuesTmp.push(infos['ema']['our_value'] !== null ? (infos['ema']['our_value'] / infos['ema']['opponent_value']).round() : '')
                                        infos['ema']['our_value'] !== null ? xgAway = infos['ema']['our_value'] : null
                                        tabValuesTmp.push(infos['our_exp_goa'].round())
                                    //tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                    tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                } else
                                    if (gameHisto['team2'] === team2) {
                                        tabValuesTmp.push(gameHisto['team1'])
                                        if (gameHisto['score1'] < gameHisto['score2']) {
                                            tabValuesTmp.push('W')
                                        }
                                        if (gameHisto['score1'] == gameHisto['score2']) {
                                            tabValuesTmp.push('D')
                                        }
                                        if (gameHisto['score1'] > gameHisto['score2']) {
                                            tabValuesTmp.push('L')
                                        }
                                        tabValuesTmp.push(gameHisto['score2'] - gameHisto['score1'])
                                        tabValuesTmp.push(infos['ema']['our_value'] !== null ? (infos['ema']['our_value'] / infos['ema']['opponent_value']).round() : '')
                                        infos['ema']['our_value'] !== null ? xgAway = infos['ema']['our_value'] : null
                                        tabValuesTmp.push(infos['our_exp_goa'].round())
                                        //tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                        tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                    }

                            })
                        tabValues.push(tabValuesTmp)
                    }

                    index++
                }

                tabValues.reverse()                

                createTable(
                     //Ema Exp Goa. => EEG
                     ['Name', 'Result', 'Score', 'EEG', 'Our', 'Opp.'],
                    tabValues,
                    tableAway
                )


                let dataEmaExpGoaBis = []


                await fetch('http://127.0.0.1:8080/api/club-soccer/ema-expected-goal-by-team/' + team2 + '/' + PERIODE_BIS)
                    .then((response) => response.json())
                    .then(async (emaAway) => {
                        let index = 0
                        for (const infos of emaAway) {

                            if (moment(dataGame['date']).isAfter(infos['date'], 'day')) {
                                infos['ema']['our_value'] !== null ? xgAwayBis = infos['ema']['our_value'] : null
                                //infos['ema']['our_value'] !== null ? dataEmaExpGoaBis.push([index, infos['ema']['our_value']]) : null
                                index++
                            }
                        }

                    })


                let graph = new jsGraphDisplay({
                    margin: MARGIN
                });

                var display = DISPLAY

                display.linkColor = "#1A39B9"

                graph.DataAdd({
                    data: dataExpGoa.slice(-SLICE),
                    display
                });

                display.linkColor = "#F7851B"

                graph.DataAdd({
                    data: dataEmaExpGoa.slice(-SLICE),
                    display
                });

                display.linkColor = "#F7251B"

                graph.DataAdd({
                    data: dataEmaExpGoaBis.slice(-SLICE),
                    display
                });

                display.linkColor = "#33CD31"

                graph.DataAdd({
                    data: dataGoa.slice(-SLICE),
                    display
                });

                graph.Draw('graphAway');

            })


            console.log(xgHome);
            console.log(xgAway);
            console.log(xgHomeBis);
            console.log(xgAwayBis);
        
            normal_distrib = new Poisson(xgHome, xgAway, 25)
            matrice_normal = normal_distrib.predict_proba();
            normal_proba = matrice_normal['percent']
           
            normal_distribBis = new Poisson(xgHomeBis, xgAwayBis, 25)
            matrice_normalBis = normal_distribBis.predict_proba();
            normal_probaBis = matrice_normalBis['percent']

            createTable(
                ['Type', '1', 'N', '2'],
                [
                    [`Predi. ${PERIODE}`, normal_proba[0].round(), normal_proba[1].round(), normal_proba[2].round()], 
                    [`Predi. ${PERIODE_BIS}`, normal_probaBis[0].round(), normal_probaBis[1].round(), normal_probaBis[2].round()]
                ],
                tablePredictions
            )
            
    })





