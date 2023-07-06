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
        console.log(attributes);
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
        } else 
        if (type) {
            attributes[type] = value
        }
    }

    _isNode () {
        return (
            typeof Node === "object" ? this.value instanceof Node : 
            this.value && typeof this.value === "object" && typeof this.value.nodeType === "number" && typeof this.value.nodeName==="string"
        );
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
                console.log(maCells);
                this.cells.push(new Cells(maCells))
            }
        } else {
            this.cells.push(new Cells(value))
        }
    }

    getCells(number) {
        if (typeof number === "number") {
            return this.cells[number]
        }
        return this.cells
    }

    setAttributes(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesRow
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
        } else 
        if (type) {
            attributes[type] = value
        }
    }
}

class Head {
    cells = []
    attributesHead = {}

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

    getCells(number) {
        if (typeof number === "number") {
            return this.cells[number]
        }
        return this.cells
    }

    setAttributes(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesHead
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
        } else 
        if (type) {
            attributes[type] = value
        }
    }
}

class Table {
    head = null
    row = []
    attributesTable = {}

    constructor() {
       
    }

    setAttributes(type, value) {
        type ? type = type.toLowerCase() : null
        let attributes = this.attributesTable
        if (attributes[type]) {
            attributes[type] = attributes[type] + ' ' + value
        } else 
        if (type) {
            attributes[type] = value
        }
    }
   
    setHead(values) {
        this.head = new Head(values)
    }

    getHead(number) {
        if (typeof number === "number") {
            return this.head.getCells(number)
        }
        if (number === undefined) {
            return this.head
        }
    }

    setRow(values) {
        this.row.push(new Row(values))
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
        })
        thead.appendChild(trH)
        table.appendChild(thead)
        let tbody = document.createElement('tbody')
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
                let attributesCells = cells.attributesCells
                let keysCells = Object.keys(attributesCells)
                if (index === 0) {
                    let th = document.createElement('th')
                    th.setAttribute('scope', 'row')
                    keysCells.forEach(key => {
                        let value = attributesCells[key]
                        th.setAttribute(key, value)
                    })
                    if (cells._isNode()) {
                        th.appendChild(cells.value)
                    } else {
                        let txt = document.createTextNode(cells.value)
                        th.appendChild(txt)
                    }
                    trB.appendChild(th)
                } else {
                    let td = document.createElement('td')
                    keysCells.forEach(key => {
                        let value = attributesCells[key]
                        td.setAttribute(key, value)
                    })
                    if (cells._isNode()) {
                        td.appendChild(cells.value)
                    } else {
                        let txt = document.createTextNode(cells.value)
                        td.appendChild(txt)
                    }
                    trB.appendChild(td)
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
}

/*
let table = new Table()

table.setAttributes("class", "table")

table.setHead(["Type", 'Home', 'Away'])
table.getHead().setAttributes('style', "max-height: 500px")
table.getHead(1).setAttributes("class", 'fw-italic')
table.getHead(2).setAttributes("class", 'fw-italic')

table.setRow(["Ema", 1.75, 1.5])
table.getRow(0).getCells(1).setAttributes("style", "color: red;")

table.draw(tableTest)

console.log(table);
*/
