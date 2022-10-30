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

module.exports = ToolsAverage