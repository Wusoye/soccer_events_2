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
            let valueForEMA = [...tab].pop()
            let tabForSM = [...tab].slice(-periode)
            let average = tabForSM.average()
            let lambda =  2 / (periode + 1)
            return (valueForEMA - average) * lambda + average
        } catch (e) {
            console.log(e);
            return e
        }
    }
}