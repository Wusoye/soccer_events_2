let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tableHome = document.getElementById('tableHome')
let tableAway = document.getElementById('tableAway')

let homeData = graphHome.getAttribute('data')
let awayData = graphAway.getAttribute('data')
const idHome = homeData.split(';')[0]
const idAway = awayData.split(';')[0]
const date = homeData.split(';')[1]

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

Number.prototype.round = function() {
    return Math.round(this * 100) / 100
}

fetch('http://127.0.0.1:8080/api/basketball/ema-by-team/' + idHome + '/' + date)
    .then((response) => response.json())
    .then((dataHome) => {

        let ema2 = parseFloat(dataHome['ema'][0]['ema2'].slice(-1)[0][1]).round()
        let ema4 = parseFloat(dataHome['ema'][1]['ema4'].slice(-1)[0][1]).round()
        let ema6 = parseFloat(dataHome['ema'][2]['ema6'].slice(-1)[0][1]).round()
        let norm = parseFloat(dataHome['ema'][3]['norm'].slice(-1)[0][1]).round()

        createTable(['Type', 'Rouge', 'Vert', 'Jaune', 'Noir'], [['Last value', ema2, ema4, ema6, norm]], tableHome)

        let graph = new jsGraphDisplay({
            margin: MARGIN
        });
        
        var display = DISPLAY

        display.linkColor = "#FF0000"

        /** 2 */

        graph.DataAdd({
            data: dataHome['ema'][0]['ema2'].slice(-SLICE),
            display
        });

        /** 4 */

        display.linkColor = "#00AD1D"

        graph.DataAdd({
            data: dataHome['ema'][1]['ema4'].slice(-SLICE),
            display
        });

        /** 6 */

        display.linkColor = "#FFBD00"

        graph.DataAdd({
            data: dataHome['ema'][2]['ema6'].slice(-SLICE),
            display
        });

        /** NORM */

        display.linkColor = "#000000"

        graph.DataAdd({
            data: dataHome['ema'][3]['norm'].slice(-SLICE),
            display
        });

        graph.Draw('graphHome');
        
    });

fetch('http://127.0.0.1:8080/api/basketball/ema-by-team/' + idAway + '/' + date)
    .then((response) => response.json())
    .then((dataAway) => {

        let ema2 = parseFloat(dataAway['ema'][0]['ema2'].slice(-1)[0][1]).round()
        let ema4 = parseFloat(dataAway['ema'][1]['ema4'].slice(-1)[0][1]).round()
        let ema6 = parseFloat(dataAway['ema'][2]['ema6'].slice(-1)[0][1]).round()
        let norm = parseFloat(dataAway['ema'][3]['norm'].slice(-1)[0][1]).round()

        createTable(['Type', 'Rouge', 'Vert', 'Jaune', 'Noir'], [['Last value', ema2, ema4, ema6, norm]], tableAway)


        let graph = new jsGraphDisplay({
            margin: MARGIN
        });
        
        var display = DISPLAY

        display.linkColor = "#FF0000"

        /** 2 */

        graph.DataAdd({
            data: dataAway['ema'][0]['ema2'].slice(-SLICE),
            display
        });

        /** 4 */

        display.linkColor = "#00AD1D"

        graph.DataAdd({
            data: dataAway['ema'][1]['ema4'].slice(-SLICE),
            display
        });

        /** 6 */

        display.linkColor = "#FFBD00"

        graph.DataAdd({
            data: dataAway['ema'][2]['ema6'].slice(-SLICE),
            display
        });

        /** NORM */

        display.linkColor = "#000000"

        graph.DataAdd({
            data: dataAway['ema'][3]['norm'].slice(-SLICE),
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