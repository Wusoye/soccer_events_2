class Table {
    #tableTitle = null
    #tableRow = []
    #attributesTable = []
    constructor(tableTitle, tableRow, attributesTable) {
        this.addTableTitle(tableTitle)
        this.addTableRow(tableRow)
        this.addAttTable(attributesTable)
    }

    addTableTitle(tableTitle) {
        if (tableTitle instanceof TableTitle && this.#tableTitle === null) {
            this.#tableTitle = tableTitle
        }
    }

    addTableRow(tableRow) {
        if (Array.isArray(tableRow)) {
            for(const indexRow in tableRow) {
                let row = tableRow[indexRow]
                if (row instanceof TableRow) {
                    this.#tableRow.push(row)
                }
            }
        } else if (row instanceof TableRow) {
            this.#tableRow.push(row)
        }
    }

    addAttTable(attributesTable) {
        if (Array.isArray(attributesTable)) {
            for(const indexAttTit in attributesTable) {
                let attribute = attributesTable[indexAttTit]
                if (typeof attribute === "object") {
                    let keys = Object.keys(attribute)
                    if (keys.includes("name") && keys.includes("value")) {
                        this.#attributesTable.push({name: attribute['name'], value: attribute['value']})
                    }
                }
            }
        } else if (typeof attributesTable === "object") {
            let keys = Object.keys(attributesTable)
            if (keys.includes("name") && keys.includes("value")) {
                this.#attributesTable.push({name: attributesTable['name'], value: attributesTable['value']})
            }
        }
    }
}

class TableCells {
    _value = null
    _attributesCells = []
    constructor(value, attributesCells) {
        if (typeof value === "string") {
            this._value = value
        } else if (typeof value === "number") {
            this._value = String(value)
        } else if (typeof value === "boolean") {
            this._value = String(value)
        } else {
            this._value = ""
        }
        
        this.addAttCells(attributesCells)
    }

    getValue() {
        return this._value.slice()
    }

    getAttCells() {
        return [...this._attributesCells]
    }

    addAttCells(attributesCells) {
        if (Array.isArray(attributesCells)) {
            for(const indexAttTit in attributesCells) {
                let attribute = attributesCells[indexAttTit]
                if (typeof attribute === "object") {
                    let keys = Object.keys(attribute)
                    if (keys.includes("name") && keys.includes("value")) {
                        this._attributesCells.push({name: attribute['name'], value: attribute['value']})
                    }
                }
            }
        } else if (typeof attributesCells === "object") {
            let keys = Object.keys(attributesCells)
            if (keys.includes("name") && keys.includes("value")) {
                this._attributesCells.push({name: attributesCells['name'], value: attributesCells['value']})
            }
        }
    }
}

class TableTitle {
    _attributesTitle = []
    _cellsTitle = []
    constructor(cells, attributesTitle) {
        this.addCells(cells)
        this.addAttTitle(attributesTitle)
    }

    getCells() {
        return [...this._cellsTitle]
    }

    getAttTitle() {
        return [...this._attributesTitle]
    }

    addAttTitle(attributesTitle) {
        if (Array.isArray(attributesTitle)) {
            for(const indexAttTit in attributesTitle) {
                let attribute = attributesTitle[indexAttTit]
                if (typeof attribute === "object") {
                    let keys = Object.keys(attribute)
                    if (keys.includes("name") && keys.includes("value")) {
                        this._attributesTitle.push({name: attribute['name'], value: attribute['value']})
                    }
                }
            }
        } else if (typeof attributesTitle === "object") {
            let keys = Object.keys(attributesTitle)
            if (keys.includes("name") && keys.includes("value")) {
                this._attributesTitle.push({name: attributesTitle['name'], value: attributesTitle['value']})
            }
        }
    }

    addCells(cells) {
        if (Array.isArray(cells)) {
            for(const indexCells in cells) {
                let maCells = cells[indexCells]
                if (maCells instanceof TableCells) {
                    this._cellsTitle.push(maCells)
                }
            }
        } else if (cells instanceof TableCells) {
            this._cellsTitle.push(cells)
        }
    }
}

class TableRow {
    _attributesRow = []
    _cellsRow = []
    constructor(cells, attributesRow) {
        this.addCells(cells)
        this.addAttRow(attributesRow)
    }

    getAttRow() {
        return [...this._attributesRow]
    }

    addAttRow(attributesRow) {
        if (Array.isArray(attributesRow)) {
            for(const indexAttTit in attributesRow) {
                let attribute = attributesRow[indexAttTit]
                if (typeof attribute === "object") {
                    let keys = Object.keys(attribute)
                    if (keys.includes("name") && keys.includes("value")) {
                        this._attributesRow.push({name: attribute['name'], value: attribute['value']})
                    }
                }
            }
        } else if (typeof attributesRow === "object") {
            let keys = Object.keys(attributesRow)
            if (keys.includes("name") && keys.includes("value")) {
                this._attributesRow.push({name: attributesRow['name'], value: attributesRow['value']})
            }
        }
    }

    addCells(cells) {
        if (Array.isArray(cells)) {
            for(const indexCells in cells) {
                let maCells = cells[indexCells]
                if (maCells instanceof TableCells) {
                    this._cellsRow.push(maCells)
                }
            }
        } else if (cells instanceof TableCells) {
            this._cellsRow.push(cells)
        }
    }
}



let title = new TableTitle([new TableCells("Type"), new TableCells("Home"), new TableCells("Away")])
let row = new TableRow([new TableCells("Xg"), new TableCells(1.75), new TableCells(0.86)])
let table = new Table(title, row)
console.log(title);
console.log(row);
console.log(table);
