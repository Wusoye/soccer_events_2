Number.prototype.round = function (decimal) {
    decimal === undefined ? decimal = 2 : null
    prod = '1'
    for (let index = 0; index < decimal; index++) {
        prod = prod + '0'
    }
    prod = parseInt(prod)
    return Math.round(this * prod) / prod
}

Array.prototype.min = function () {
    let res = this
    return Math.min(...res)
}

Array.prototype.max = function () {
    let res = this
    return Math.max(...res)
}

function createTable(titles, values, node) {
    let table = document.createElement('table')
    table.setAttribute('class', 'table')
    let thead = document.createElement('thead')
    let trH = document.createElement('tr')
    titles.forEach(title => {
        if (typeof title !== "object") {
            let th = document.createElement('th')
            th.setAttribute('scope', 'col')
            //th.setAttribute('style')
            let txt = document.createTextNode(title)
            th.appendChild(txt)
            trH.appendChild(th)
        } else {
            let valueCel = title['value']
            let balises = title['balise']
            let th = document.createElement('th')
            th.setAttribute('scope', 'col')
            for(const indexBal in balises) {
                let balise = balises[indexBal]
                th.setAttribute(balise['name'], balise['value'])
            }
            let txt = document.createTextNode(valueCel)
            th.appendChild(txt)
            trH.appendChild(th)
        }        
    })
    thead.appendChild(trH)
    table.appendChild(thead)
    let tbody = document.createElement('tbody')
    values.forEach(ligne => {
        let trB = document.createElement('tr')
        ligne.forEach((value, index) => {
            if (typeof value !== "object") {
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
            } else {
                let valueCel = value['value']
                let balises = value['balise']
                if (index === 0) {
                    let th = document.createElement('th')
                    th.setAttribute('scope', 'row')
                    for(const indexBal in balises) {
                        let balise = balises[indexBal]
                        th.setAttribute(balise['name'], balise['value'])
                    }
                    let txt = document.createTextNode(valueCel)
                    th.appendChild(txt)
                    trB.appendChild(th)
                } else {
                    let td = document.createElement('td')
                    for(const indexBal in balises) {
                        let balise = balises[indexBal]
                        td.setAttribute(balise['name'], balise['value'])
                    }
                    let txt = document.createTextNode(valueCel)
                    td.appendChild(txt)
                    trB.appendChild(td)
                }
            }
        })
        tbody.appendChild(trB)
    })
    table.appendChild(tbody)
    if (typeof node === "string") {
        document.getElementById(node).appendChild(table)
    } else {
        node.appendChild(table)
    }
}


class Odds {
    static perToOdds(percent) {
        return 1 / percent * 100
    }
    static proToOdds(proba) {
        return 1 / proba
    }
    static oddsToPer(odds) {
        return 1 / odds * 100
    }
    static oddsToPro(odds) {
        return 1 / odds
    }
    static oddsAddPer(odds, percent) {
        return (odds * percent) / 100 - percent / 100 + odds
        
    }
    static oddsAddPro(odds, proba) {
        return (odds * proba) - proba + odds
        
    }
    static drop(start, end) {
        return ((start - end)/(end - 1)*100)
    }
}


class Poisson {
    static #init(homeExpGoal, awayExpGoal, maxGoalDist) {
        this.homeDistrib = []
        this.awayDistrib = []

        for (let i = 0; i <= maxGoalDist; i++) {
            let kFact = fact(i)

            let local = Math.exp(-homeExpGoal) * (Math.pow(homeExpGoal, i) / kFact)
            let visitor = Math.exp(-awayExpGoal) * (Math.pow(awayExpGoal, i) / kFact)

            this.homeDistrib.push(local)
            this.awayDistrib.push(visitor)
        }
    }

    static getGoal(homeExpGoal, awayExpGoal, maxGoalDist, maxGoalView) {
        this.#init(homeExpGoal, awayExpGoal, maxGoalDist)
        maxGoalView === undefined ? maxGoalView = 5 : null 
        return [this.homeDistrib.slice(0, maxGoalView), this.awayDistrib.slice(0, maxGoalView)]
    }

    static getProba(homeExpGoal, awayExpGoal, maxGoalDist) {
        this.#init(homeExpGoal, awayExpGoal, maxGoalDist)
        let home_prob = 0
        let draw_prob = 0
        let away_prob = 0

        for (let local_i = 0; local_i < this.homeDistrib.length; local_i++) {
            for (let visitor_i = 0; visitor_i < this.awayDistrib.length; visitor_i++) {

                let local_prob_score = this.homeDistrib[local_i]
                let visitor_prob_score = this.awayDistrib[visitor_i]

                if (local_i > visitor_i) {
                    home_prob = local_prob_score * visitor_prob_score + home_prob
                }
                if (local_i == visitor_i) {
                    draw_prob = local_prob_score * visitor_prob_score + draw_prob
                }
                if (local_i < visitor_i) {
                    away_prob = local_prob_score * visitor_prob_score + away_prob
                }
            }
        }

        //return [home_prob, draw_prob, away_prob]
        return {home: home_prob, draw: draw_prob, away: away_prob}
    }

    static getScore(homeExpGoal, awayExpGoal, maxGoalDist, maxGoalView) {
        this.#init(homeExpGoal, awayExpGoal, maxGoalDist)
        maxGoalView === undefined ? maxGoalView = 5 : null 
        let matriceGoalDistrib = []

        for (let local_i = 0; local_i < this.homeDistrib.length; local_i++) {
            for (let visitor_i = 0; visitor_i < this.awayDistrib.length; visitor_i++) {

                let local_prob_score = this.homeDistrib[local_i]
                let visitor_prob_score = this.awayDistrib[visitor_i]

                if (local_i <= maxGoalView && visitor_i <= maxGoalView) {
                    let score = String(local_i + '-' + visitor_i)
                    matriceGoalDistrib.push({ score: score, prob: local_prob_score * visitor_prob_score })
                }

            }
        }

        return matriceGoalDistrib.sort(compareProbScore)
    }
}


function compareProbScore(a, b) {
    a = a['prob']
    b = b['prob']
    if (a > b) {
        return -1
    } if (a < b) {
        return 1
    }
    return 0
}


function fact(nbr) {
    var i, nbr, f = 1;
    for (i = 1; i <= nbr; i++) {
        f = f * i;   // ou f *= i;
    }
    return f;
}


Array.prototype.sum = function () {
    const sum = this.reduce((accumulator, value) => {
        return accumulator + value;
    }, 0);

    return sum
}

Array.prototype.average = function () {
    let tab = [...this]
    const sum = tab.reduce((accumulator, value) => {
        return accumulator + value;
    }, 0);

    return sum / tab.length
}

class ToolsAverage {
    static ema(tab, periode) {
        try {
            if (tab.length <= periode) throw new Error('Periode trop grande par rapport aux données disponobles')
            let tabEma = [...tab]
            if (typeof tabEma[0] === "number") {
                let valueForEMA = tabEma.pop()
                let tabForSM = tabEma.slice(-periode)
                let average = tabForSM.average()
                let lambda =  2 / (periode + 1)
                return (valueForEMA - average) * lambda + average
            } else if (typeof tabEma[0] === "object") {
                let keys = Object.keys(tabEma[0])
                let goodKey = null
                keys.forEach(key => {
                    if (typeof tabEma[0][key] === "number") goodKey = key
                })
                let valueForEMA = tabEma.pop()
                let tabForSM = tabEma.slice(-periode)
                const sum = tabForSM.reduce((accumulator, value) => {
                    return accumulator + value[goodKey];
                }, 0);
                let average = sum / tabForSM.length
                let lambda =  2 / (periode + 1)
                return (valueForEMA[goodKey] - average) * lambda + average
            }
            
        } catch (e) {
            console.log(e);
            return e
        }
    }

    static emaObj(tab, periode, key) {
        
        try {
            if (tab.length <= periode) throw new Error('Periode trop grande par rapport aux données disponobles')
            let tabEma = [...tab]
            let goodKey = key
            let valueForEMA = tabEma.pop()
            let tabForSM = tabEma.slice(-periode)
            const sum = tabForSM.reduce((accumulator, value) => {
                return accumulator + value[goodKey];
            }, 0);
            let average = sum / tabForSM.length
            let lambda =  2 / (periode + 1)
            return (valueForEMA[goodKey] - average) * lambda + average
            
        } catch (e) {
            return e
        }
    }

    static emaMulti(tab, periode) {
        let tabReturn = []
        if (periode === 0 || periode === null || periode === undefined) {
            tab.forEach((el, index) => {
                tabReturn.push([index+1, el['scoreAvg']])
            })
        } else {
            for (let index = 1; index <= tab.length; index++) {
                if (index > periode) {
                    tabReturn.push([index, this.ema(tab.slice(0, index), periode)]);
                }    
            }
        }
        return tabReturn
    }
}


class Fetch {
    static async get(url) {
        const response = await fetch(url)
        const data = await response.json()
        return data
    }
}


class Cells {
    value = null
    attributesCells = {}

    constructor(value) {
        this.addCells(value)
    }

    addCells(values) {
        this.value = values
    }

    setAttributes(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesCells
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
            return this
        } else 
        if (type) {
            attributes[type] = value
            return this
        }
    }
}

class Row {
    cells = []
    attributesRow = {}

    constructor(values) {
        this.addCells(values)
    }

    addCells(value) {
        if (Array.isArray(value)) {
            for(const indexCells in value) {
                let maCells = value[indexCells]
                this.cells.push(new Cells(maCells))
            }
        } else {
            this.cells.push(new Cells(value))
        }
    }


    getCells(target) {
        if (typeof target === "number") {
            return this.cells[target]
        }
        if (typeof target === "string") {
            let nice 
            this.cells.forEach(_cells => {
                if (_cells['value'] === target) {
                    nice = _cells
                }
            })
            return nice || this.cells
        }
        return this.cells
    }

    setAttributes(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesRow
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
            return this
        } else 
        if (type) {
            attributes[type] = value
            return this
        }
    }
}

class Head {
    cells = []
    attributesHead = {}

    constructor(values) {
        if (values !== undefined) {
            this.addCells(values)
        }
    }

    addCells(value) {
        if (Array.isArray(value)) {
            for(const indexCells in value) {
                let maCells = value[indexCells]
                this.cells.push(new Cells(maCells))
            }
        } else {
            this.cells.push(new Cells(value))
        }
    }

    getCells(target) {
        if (typeof target === "number") {
            return this.cells[target]
        }
        if (typeof target === "string") {
            let nice 
            this.cells.forEach(_cells => {
                if (_cells['value'] === target) {
                    nice = _cells
                }
            })
            return nice || this.cells
        }
        return this.cells
    }

    setAttributes(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesHead
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
            return this
        } else 
        if (type) {
            attributes[type] = value
            return this
        }
    }
}

class Table {
    head = new Head()
    row = []
    attributesTable = {}
    attributesBody = {}

    constructor() {
       
    }

    setAttributes(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesTable
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
            return this
        } else 
        if (type) {
            attributes[type] = value
            return this
        }
    }

    setAttributesBody(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesBody
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
            return this
        } else 
        if (type) {
            attributes[type] = value
            return this
        }
    }
   
    setHead(values) {
        this.head.addCells(values)
        return this.head
    }

    getHead(target) {
        if (typeof target === "number") {
            return this.head.getCells(target)
        }
        if (typeof target === "string") {
            this.head.cells.forEach(cells => {
                if (cells.value === target) {
                    return this.head.getCells(target)
                }
            })
        }
        if (target === undefined) {
            return this.head
        }
    }

    setRow(values) {
        let newRow = new Row(values)
        this.row.push(newRow)
        return newRow
    }

    getRow(number) {
        if (typeof number === "number") {
            return this.row[number]
        }
        return this.row[this.row.length-1]
    }

    draw(node) {
        let table = document.createElement('table')
        let attributesTable = this.attributesTable
        let keysTable = Object.keys(this.attributesTable)
        keysTable.forEach(key => {
            let value = attributesTable[key]
            table.setAttribute(key, value)
        })
        let thead = document.createElement('thead')
        let trH = document.createElement('tr')
        let attributesHead = this.head.attributesHead
        let keysHead = Object.keys(attributesHead)
        keysHead.forEach(key => {
            let value = attributesHead[key]
            trH.setAttribute(key, value)
        })
        let cellsHead = this.head.getCells()
        cellsHead.forEach(cells => {
            if (typeof cells.value !== 'function') {
                let value = cells.value
                let attributesCells = cells.attributesCells
                let keys = Object.keys(attributesCells)
                let th = document.createElement('th')
                keys.forEach(key => {
                    th.setAttribute(key, attributesCells[key])
                })
                let txt = document.createTextNode(value)
                th.appendChild(txt)
                trH.appendChild(th) 
            }
        })
        thead.appendChild(trH)
        table.appendChild(thead)
        let tbody = document.createElement('tbody')
        let attributesBody = this.attributesBody
        let keysBody = Object.keys(this.attributesBody)
        keysBody.forEach(key => {
            let value = attributesBody[key]
            tbody.setAttribute(key, value)
        })
        let rows = this.row
        rows.forEach(row => {
            let trB = document.createElement('tr')
            let attributesRow = row.attributesRow
            let keysRow = Object.keys(attributesRow)
            keysRow.forEach(key => {
                let value = attributesRow[key]
                trB.setAttribute(key, value)
            })
            let cellsRow = row.getCells()
            cellsRow.forEach((cells, index) => {
                if (typeof cells.value !== 'function') {
                    let attributesCells = cells.attributesCells
                    let keysCells = Object.keys(attributesCells)
                    if (index === 0) {
                        let th = document.createElement('th')
                        th.setAttribute('scope', 'row')
                        keysCells.forEach(key => {
                            let value = attributesCells[key]
                            th.setAttribute(key, value)
                        })
                        let txt = document.createTextNode(cells.value)
                        th.appendChild(txt)
                        trB.appendChild(th)
                    } else {
                        let td = document.createElement('td')
                        keysCells.forEach(key => {
                            let value = attributesCells[key]
                            td.setAttribute(key, value)
                        })
                        let txt = document.createTextNode(cells.value)
                        td.appendChild(txt)
                        trB.appendChild(td)
                    }
                }
            })
            tbody.appendChild(trB)
        })
        table.appendChild(tbody)
        if (typeof node === "string") {
            document.getElementById(node).appendChild(table)
        } else {
            node.appendChild(table)
        }
    }

    delete(node) {
        this.head = new Head()
        this.row = []
        this.attributesTable = {}
        this.attributesBody = {}
        if (typeof node === "string") {
            let element = document.getElementById(node);
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        } else {
            let element = node;
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }
}


/*
let table = new Table()

table.setAttributes("class", "table")

table.setHead(["Type", 'Home', 'Away'])
table.getHead().setAttributes('style', "max-height: 500px")
table.getHead().addCells("newCells")
table.getHead(1).setAttributes("class", 'fw-italic')
table.getHead(2).setAttributes("class", 'fw-italic')

table.setRow(["Ema", 1.75, 1.5])
table.getRow(0).getCells(1).setAttributes("style", "color: red;")
table.getRow(0).addCells('newCellsRow')

table.draw(tableTest)

/*********************************************************************** */

/*
let table = new Table()

table.setAttributes("class", "table")

table.setHead(['Type', 'Home', 'Away'])

for(let i = 0; i < 5; i++) {
    let home = i+0.24
    let away = i-0.12
    table.setRow([`${i}`, home, away])
    if (home < 1) {
        table.getRow().getCells(1).setAttributes('style', 'color: red;')
    }
    if (away < 1) {
        table.getRow().getCells(2).setAttributes('style', 'color: red;')
    }
}

table.draw(tableTest)

console.log(table);
*/
