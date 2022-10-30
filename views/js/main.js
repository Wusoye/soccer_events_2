let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tableHome = document.getElementById('tableHome')
let tableAway = document.getElementById('tableAway')
let tableHomeOpponent = document.getElementById('tableHomeOpponent')
let tableAwayOpponent = document.getElementById('tableAwayOpponent')

let homeData = graphHome.getAttribute('data')
let awayData = graphAway.getAttribute('data')
const idHome = homeData.split(';')[0]
const idAway = awayData.split(';')[0]
const date = homeData.split(';')[1]

const SLICE = 35

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

Number.prototype.round = function(decimal) {
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

fetch('http://127.0.0.1:8080/api/basketball/ema-by-team/' + idHome + '/' + date)
    .then((response) => response.json())
    .then((dataHome) => {
        
        let tabEma2 = dataHome['emaTeam']['ema'][0]['ema2']
        let tabEma4 = dataHome['emaTeam']['ema'][1]['ema4']
        let tabEma6 = dataHome['emaTeam']['ema'][2]['ema6']
        let tabNorm = dataHome['emaTeam']['ema'][3]['norm']

        let ema2 = parseFloat(tabEma2.slice(-1)[0][1]).round()
        let ema4 = parseFloat(tabEma4.slice(-1)[0][1]).round()
        let ema6 = parseFloat(tabEma6.slice(-1)[0][1]).round()
        let norm = parseFloat(tabNorm.slice(-1)[0][1]).round()

        let incEma2 = parseFloat(tabEma2.slice(-2)[1][1] - tabEma2.slice(-2)[0][1]).round()
        let incEma4 = parseFloat(tabEma4.slice(-2)[1][1] - tabEma4.slice(-2)[0][1]).round()
        let incEma6 = parseFloat(tabEma6.slice(-2)[1][1] - tabEma6.slice(-2)[0][1]).round()
        let incNorm = parseFloat(tabNorm.slice(-2)[1][1] - tabNorm.slice(-2)[0][1]).round()

        
        let maxEma2 = max(tabEma2.slice(-SLICE))
        let maxEma4 = max(tabEma4.slice(-SLICE))
        let maxEma6 = max(tabEma6.slice(-SLICE))
        let maxNorm = max(tabNorm.slice(-SLICE))


        let minEma2 = min(tabEma2.slice(-SLICE))
        let minEma4 = min(tabEma4.slice(-SLICE))
        let minEma6 = min(tabEma6.slice(-SLICE))
        let minNorm = min(tabNorm.slice(-SLICE))

        const bornInf = -1
        const bornSup = 1


        let interEma2 = ((ema2-minEma2)/(maxEma2-minEma2) * 100).round(0)
        let interEma4 = ((ema4-minEma4)/(maxEma4-minEma4) * 100).round(0)
        let interEma6 = ((ema6-minEma6)/(maxEma6-minEma6) * 100).round(0)
        let interNorm = ((norm-minNorm)/(maxNorm-minNorm) * 100).round(0)

        createTable(
            ['Type', 'Noir', 'Rouge', 'Vert', 'Jaune'], 
            [
                ['Inter.', interNorm, interEma2, interEma4, interEma6],
                ['Last value', norm, ema2, ema4, ema6], 
                ['Last inc.', incNorm, incEma2, incEma4, incEma6], 
                ['Norm / Ema', "", (norm - ema2).round(), (norm - ema4).round(), (norm - ema6).round()],
                ['Max', maxNorm, maxEma2, maxEma4, maxEma6],
                ['Min', minNorm, minEma2, minEma4, minEma6]
            ], 
            tableHome
        )

        let tabOpponent = dataHome['statisticsOpponents']

        let tabValues = []

        tabOpponent.forEach((game) => {
            let tabValuesTmp = []
            if (game['teams']['home']['id'] === parseInt(idHome)) {
                tabValuesTmp.push(game['teams']['away']['name'])
            } else if (game['teams']['away']['id'] === parseInt(idHome)) {
                tabValuesTmp.push(game['teams']['home']['name'])
            }
            tabValuesTmp.push(game['statistics']['win'] ? 'W' : 'L')
           
            let maxEma2 = max(game['statistics']['emaTeam']['ema'][0]['ema2'].slice(-SLICE))
            let maxEma4 = max(game['statistics']['emaTeam']['ema'][1]['ema4'].slice(-SLICE))
            let maxEma6 = max(game['statistics']['emaTeam']['ema'][2]['ema6'].slice(-SLICE))
            let maxNorm = max(game['statistics']['emaTeam']['ema'][3]['norm'].slice(-SLICE))


            let minEma2 = min(game['statistics']['emaTeam']['ema'][0]['ema2'].slice(-SLICE))
            let minEma4 = min(game['statistics']['emaTeam']['ema'][1]['ema4'].slice(-SLICE))
            let minEma6 = min(game['statistics']['emaTeam']['ema'][2]['ema6'].slice(-SLICE))
            let minNorm = min(game['statistics']['emaTeam']['ema'][3]['norm'].slice(-SLICE))

            const bornInf = -1
            const bornSup = 1


            let interEma2 = ((game['statistics']['emaTeam']['ema'][0]['ema2'].slice(-1)[0][1]-minEma2)/(maxEma2-minEma2) * 100).round(0)
            let interEma4 = ((game['statistics']['emaTeam']['ema'][1]['ema4'].slice(-1)[0][1]-minEma4)/(maxEma4-minEma4) * 100).round(0)
            let interEma6 = ((game['statistics']['emaTeam']['ema'][2]['ema6'].slice(-1)[0][1]-minEma6)/(maxEma6-minEma6) * 100).round(0)
            let interNorm = ((game['statistics']['emaTeam']['ema'][3]['norm'].slice(-1)[0][1]-minNorm)/(maxNorm-minNorm) * 100).round(0)

            tabValuesTmp.push(interNorm)
            tabValuesTmp.push(interEma2)
            tabValuesTmp.push(interEma4)
            tabValuesTmp.push(interEma6)

            tabValues.push(tabValuesTmp)
        })

        createTable(
            ['Team', 'Result', 'Noir', 'Rouge', 'Vert', 'Jaune'],
            tabValues,
            tableHomeOpponent
        )

        let graph = new jsGraphDisplay({
            margin: MARGIN
        });
        
        var display = DISPLAY

        display.linkColor = "#FF0000"
        display.dataType = ""
        

        /** 2 */

        graph.DataAdd({
            data: tabEma2.slice(-SLICE),
            display
        });

        /** 4 */

        display.linkColor = "#00AD1D"

        graph.DataAdd({
            data: tabEma4.slice(-SLICE),
            display
        });

        /** 6 */

        display.linkColor = "#FFBD00"

        graph.DataAdd({
            data: tabEma6.slice(-SLICE),
            display
        });

        /** NORM */

        display.linkColor = "#000000"
        display.dataType = "rectangle"

        graph.DataAdd({
            data: tabNorm.slice(-SLICE),
            display
        });

        graph.Draw('graphHome');
        
    });

fetch('http://127.0.0.1:8080/api/basketball/ema-by-team/' + idAway + '/' + date)
    .then((response) => response.json())
    .then((dataAway) => {

        let tabEma2 = dataAway['emaTeam']['ema'][0]['ema2']
        let tabEma4 = dataAway['emaTeam']['ema'][1]['ema4']
        let tabEma6 = dataAway['emaTeam']['ema'][2]['ema6']
        let tabNorm = dataAway['emaTeam']['ema'][3]['norm']

        let ema2 = parseFloat(tabEma2.slice(-1)[0][1]).round()
        let ema4 = parseFloat(tabEma4.slice(-1)[0][1]).round()
        let ema6 = parseFloat(tabEma6.slice(-1)[0][1]).round()
        let norm = parseFloat(tabNorm.slice(-1)[0][1]).round()

        let incEma2 = parseFloat(tabEma2.slice(-2)[1][1] - tabEma2.slice(-2)[0][1]).round()
        let incEma4 = parseFloat(tabEma4.slice(-2)[1][1] - tabEma4.slice(-2)[0][1]).round()
        let incEma6 = parseFloat(tabEma6.slice(-2)[1][1] - tabEma6.slice(-2)[0][1]).round()
        let incNorm = parseFloat(tabNorm.slice(-2)[1][1] - tabNorm.slice(-2)[0][1]).round()

        let maxEma2 = max(tabEma2.slice(-SLICE))
        let maxEma4 = max(tabEma4.slice(-SLICE))
        let maxEma6 = max(tabEma6.slice(-SLICE))
        let maxNorm = max(tabNorm.slice(-SLICE))

        let minEma2 = min(tabEma2.slice(-SLICE))
        let minEma4 = min(tabEma4.slice(-SLICE))
        let minEma6 = min(tabEma6.slice(-SLICE))
        let minNorm = min(tabNorm.slice(-SLICE))


        let interEma2 = ((ema2-minEma2)/(maxEma2-minEma2) * 100).round(0)
        let interEma4 = ((ema4-minEma4)/(maxEma4-minEma4) * 100).round(0)
        let interEma6 = ((ema6-minEma6)/(maxEma6-minEma6) * 100).round(0)
        let interNorm = ((norm-minNorm)/(maxNorm-minNorm) * 100).round(0)

        createTable(
            ['Type', 'Noir', 'Rouge', 'Vert', 'Jaune'], 
            [
                ['Inter.', interNorm, interEma2, interEma4, interEma6],
                ['Last value', norm, ema2, ema4, ema6], 
                ['Last inc.', incNorm, incEma2, incEma4, incEma6], 
                ['Norm / Ema', "", (norm - ema2).round(), (norm - ema4).round(), (norm - ema6).round()],
                ['Max', maxNorm, maxEma2, maxEma4, maxEma6],
                ['Min', minNorm, minEma2, minEma4, minEma6]
            ], 
            tableAway
        )


        let tabOpponent = dataAway['statisticsOpponents']

        let tabValues = []

        tabOpponent.forEach(game => {
            let tabValuesTmp = []
            if (game['teams']['home']['id'] === parseInt(idAway)) {
                tabValuesTmp.push(game['teams']['away']['name'])
            } else if (game['teams']['away']['id'] === parseInt(idAway)) {
                tabValuesTmp.push(game['teams']['home']['name'])
            }
            tabValuesTmp.push(game['statistics']['win'] ? 'W' : 'L')
            let maxEma2Op = max(game['statistics']['emaTeam']['ema'][0]['ema2'].slice(-SLICE))
            let maxEma4Op = max(game['statistics']['emaTeam']['ema'][1]['ema4'].slice(-SLICE))
            let maxEma6Op = max(game['statistics']['emaTeam']['ema'][2]['ema6'].slice(-SLICE))
            let maxNormOp = max(game['statistics']['emaTeam']['ema'][3]['norm'].slice(-SLICE))


            let minEma2Op = min(game['statistics']['emaTeam']['ema'][0]['ema2'].slice(-SLICE))
            let minEma4Op = min(game['statistics']['emaTeam']['ema'][1]['ema4'].slice(-SLICE))
            let minEma6Op = min(game['statistics']['emaTeam']['ema'][2]['ema6'].slice(-SLICE))
            let minNormOp = min(game['statistics']['emaTeam']['ema'][3]['norm'].slice(-SLICE))

            const bornInf = -1
            const bornSup = 1


            let interEma2Op = ((game['statistics']['emaTeam']['ema'][0]['ema2'].slice(-1)[0][1]-minEma2Op)/(maxEma2Op-minEma2Op) * 100).round(0)
            let interEma4Op = ((game['statistics']['emaTeam']['ema'][1]['ema4'].slice(-1)[0][1]-minEma4Op)/(maxEma4Op-minEma4Op) * 100).round(0)
            let interEma6Op = ((game['statistics']['emaTeam']['ema'][2]['ema6'].slice(-1)[0][1]-minEma6Op)/(maxEma6Op-minEma6Op) * 100).round(0)
            let interNormOp = ((game['statistics']['emaTeam']['ema'][3]['norm'].slice(-1)[0][1]-minNormOp)/(maxNormOp-minNormOp) * 100).round(0)

            console.log(game['statistics']['emaTeam']['ema'][0]['ema2'].slice(-SLICE));
            console.log(game['statistics']['emaTeam']['ema'][0]['ema2']);
            console.log(minEma2);
            console.log(maxEma2);

            tabValuesTmp.push(interNormOp)
            tabValuesTmp.push(interEma2Op)
            tabValuesTmp.push(interEma4Op)
            tabValuesTmp.push(interEma6Op)
            tabValues.push(tabValuesTmp)
        })

        createTable(
            ['Team', 'Result', 'Noir', 'Rouge', 'Vert', 'Jaune'],
            tabValues,
            tableAwayOpponent
        )


        let graph = new jsGraphDisplay({
            margin: MARGIN
        });
        
        var display = DISPLAY

        display.linkColor = "#FF0000"
        display.dataType = ""

        /** 2 */

        graph.DataAdd({
            data: tabEma2.slice(-SLICE),
            display
        });

        /** 4 */

        display.linkColor = "#00AD1D"

        graph.DataAdd({
            data: tabEma4.slice(-SLICE),
            display
        });

        /** 6 */

        display.linkColor = "#FFBD00"

        graph.DataAdd({
            data: tabEma6.slice(-SLICE),
            display
        });

        /** NORM */

        display.linkColor = "#000000"
        display.dataType = "rectangle"

        graph.DataAdd({
            data: tabNorm.slice(-SLICE),
            display
        });

        graph.Draw('graphAway');
    });


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
            if (index === 0) { 
                let th = document.createElement('th') 
                th.setAttribute('scope', 'row')
                let txt = document.createTextNode(value)
                th.appendChild(txt)
                trB.appendChild(th)
            } else {
                let td = document.createElement('th') 
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