/*Number.prototype.round = function (decimal) {
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
}*/

Number.prototype.round = function (decimal) {
    decimal === undefined ? decimal = 2 : null
    prod = '1'
    for (let index = 0; index < decimal; index++) {
        prod = prod + '0'
    }
    prod = parseInt(prod)
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

class Poisson {
    static init(homeExpGoal, awayExpGoal, maxGoalDist) {
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

    static getGoal(homeExpGoal, awayExpGoal, maxGoalDist) {
        this.init(homeExpGoal, awayExpGoal, maxGoalDist)
        return [this.homeDistrib, this.awayDistrib]
    }

    static getProba(homeExpGoal, awayExpGoal, maxGoalDist) {
        this.init(homeExpGoal, awayExpGoal, maxGoalDist)
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
        this.init(homeExpGoal, awayExpGoal, maxGoalDist)
        maxGoalView ? null : maxGoalView = 5
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
