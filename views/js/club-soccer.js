let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tableHome = document.getElementById('tableHome')
let tableAway = document.getElementById('tableAway')

let homeData = graphHome.getAttribute('data')
let awayData = graphAway.getAttribute('data')

const idGame = homeData.split(';')[0]
const team1 = homeData.split(';')[1]
const team2 = awayData.split(';')[1]

const PERIODE = 5

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




function createTable(titles, values, node) {
    let table = document.createElement('table')
    table.setAttribute('class', 'table')
    let thead = document.createElement('thead')
    let trH = document.createElement('tr')
    titles.forEach(title => {
        let th = document.createElement('th')
        th.setAttribute('scope', 'col')
        //th.setAttribute('style')
        let txt = document.createTextNode(title)
        th.appendChild(txt)
        trH.appendChild(th)
    })
    thead.appendChild(trH)
    table.appendChild(thead)
    let tbody = document.createElement('tbody')
    values.forEach(ligne => {
        let trB = document.createElement('tr')
        ligne.forEach((value, index) => {
            console.log(index);
            if (index === 0) {
                let th = document.createElement('th')
                th.setAttribute('scope', 'row')
                let txt = document.createTextNode(value)
                th.appendChild(txt)
                trB.appendChild(th)
            } else {
                let td = document.createElement('td')
                let txt = document.createTextNode(value)
                td.appendChild(txt)
                trB.appendChild(td)
            }
        })
        tbody.appendChild(trB)
    })
    table.appendChild(tbody)
    node.appendChild(table)
}


fetch('http://127.0.0.1:8080/api/club-soccer/games-by-id/' + idGame)
    .then((response) => response.json())
    .then((dataGame) => {

        fetch('http://127.0.0.1:8080/api/club-soccer/ema-expected-goal-by-team/' + team1 + '/' + PERIODE)
            .then((response) => response.json())
            .then(async (emaHome) => {

                let dataExpGoa = []
                let dataEmaExpGoa = []
                let tabValues = []
                let index = 0

                for (const infos of emaHome) {
                    let tabValuesTmp = []
                    if (moment(dataGame['date']).isAfter(infos['date'], 'day')) {
                        infos['ema']['our_value'] !== null ? dataEmaExpGoa.push([index, infos['ema']['our_value']]) : null
                        dataExpGoa.push([index, infos['our_exp_goa']])

                        let _id = infos['_id']
                        let nameHisto = null

                        await fetch('http://127.0.0.1:8080/api/club-soccer/games-by-id/' + _id)
                            .then((response) => response.json())
                            .then((gameHisto) => {

                                if (gameHisto['team1'] === team1) {
                                    nameHisto = gameHisto['team2']
                                    tabValuesTmp.push(gameHisto['team2'])
                                    tabValuesTmp.push(gameHisto['score1'] > gameHisto['score2'] ? 'W' : 'L')
                                    tabValuesTmp.push(gameHisto['score1'] + ' - ' + gameHisto['score2'])
                                    tabValuesTmp.push(infos['ema']['our_value'] !== null ? infos['ema']['our_value'].round() : '')
                                    tabValuesTmp.push(infos['our_exp_goa'].round())
                                    tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                    tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                } else
                                    if (gameHisto['team2'] === team1) {
                                        tabValuesTmp.push(gameHisto['team1'])
                                        tabValuesTmp.push(gameHisto['score2'] > gameHisto['score1'] ? 'W' : 'L')
                                        tabValuesTmp.push(gameHisto['score1'] + ' - ' + gameHisto['score2'])
                                        tabValuesTmp.push(infos['ema']['our_value'] !== null ? infos['ema']['our_value'].round() : '')
                                        tabValuesTmp.push(infos['our_exp_goa'].round())
                                        tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                        tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                    }

                            })
                        console.log(tabValuesTmp[0]);
                        tabValues.push(tabValuesTmp)
                    }

                    index++
                }
                
                createTable(
                    ['Name', 'Result', 'Score', 'Our Ema', 'Our Exp.', 'Opp Ema', 'Opp Exp.'],
                    tabValues.reverse(),
                    tableHome
                )


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

                graph.Draw('graphHome');

            })

        fetch('http://127.0.0.1:8080/api/club-soccer/ema-expected-goal-by-team/' + team2 + '/' + PERIODE)
            .then((response) => response.json())
            .then(async (emaAway) => {


                let dataExpGoa = []
                let dataEmaExpGoa = []
                let tabValues = []
                let index = 0

                for (const infos of emaAway) {
                    let tabValuesTmp = []
                    if (moment(dataGame['date']).isAfter(infos['date'], 'day')) {
                        infos['ema']['our_value'] !== null ? dataEmaExpGoa.push([index, infos['ema']['our_value']]) : null
                        dataExpGoa.push([index, infos['our_exp_goa']])

                        let _id = infos['_id']
                        let nameHisto = null

                        await fetch('http://127.0.0.1:8080/api/club-soccer/games-by-id/' + _id)
                            .then((response) => response.json())
                            .then((gameHisto) => {

                                if (gameHisto['team1'] === team2) {
                                    nameHisto = gameHisto['team2']
                                    tabValuesTmp.push(gameHisto['team2'])
                                    tabValuesTmp.push(gameHisto['score1'] > gameHisto['score2'] ? 'W' : 'L')
                                    tabValuesTmp.push(gameHisto['score1'] + ' - ' + gameHisto['score2'])
                                    tabValuesTmp.push(infos['ema']['our_value'] !== null ? infos['ema']['our_value'].round() : '')
                                    tabValuesTmp.push(infos['our_exp_goa'].round())
                                    tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                    tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                } else
                                    if (gameHisto['team2'] === team2) {
                                        tabValuesTmp.push(gameHisto['team1'])
                                        tabValuesTmp.push(gameHisto['score2'] > gameHisto['score1'] ? 'W' : 'L')
                                        tabValuesTmp.push(gameHisto['score1'] + ' - ' + gameHisto['score2'])
                                        tabValuesTmp.push(infos['ema']['our_value'] !== null ? infos['ema']['our_value'].round() : '')
                                        tabValuesTmp.push(infos['our_exp_goa'].round())
                                        tabValuesTmp.push(infos['ema']['opponent_value'] !== null ? infos['ema']['opponent_value'].round() : '')
                                        tabValuesTmp.push(infos['opponent_exp_goa'].round())
                                    }

                            })
                        console.log(tabValuesTmp[0]);
                        tabValues.push(tabValuesTmp)
                    }

                    index++
                }
                
                createTable(
                    ['Name', 'Result', 'Score', 'Our Ema', 'Our Exp.', 'Opp Ema', 'Opp Exp.'],
                    tabValues.reverse(),
                    tableAway
                )


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

                graph.Draw('graphAway');

            })

    })





Number.prototype.round = function (decimal) {
    let prod = 100
    switch (decimal) {
        case 0:
            prod = 1
            break;
        case 1:
            prod = 10
            break;
        case 2:
            prod = 100
            break;
        case 3:
            prod = 1000
            break;
        case 4:
            prod = 10000
            break;

        default:
            prod = 100
            break;
    }
    return Math.round(this * prod) / prod
}

function max(tab) {
    let tabReturn = []

    tab.slice(-SLICE).forEach(el => {
        tabReturn.push(el[1])
    })

    return Math.max(...tabReturn).round()
}

function min(tab) {
    let tabReturn = []

    tab.slice(-SLICE).forEach(el => {
        tabReturn.push(el[1])
    })

    return Math.min(...tabReturn).round()
}