/*(async function () {
    function compareCountry(a, b) {
        if (a['country']['id'] < b['country']['id']) {
            return -1;
        }
        if (a['country']['id'] < b['country']['id']) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }

    function setTable() {
        let elTable = document.createElement('table')
        elTable.setAttribute('class', 'table')
        let elTHead = document.createElement('tHead')
        let elTr = document.createElement('tr')
        let elTh = document.createElement('th')

    }

    const response = await fetch('http://127.0.0.1:8080/api/basketball/games-by-date/2022-10-24')
    const data = await response.json()
    console.log(data);
    //if (data != null || data != undefined) throw new Error('Pas de data')
    gamesByDate = data[0]
    console.log(gamesByDate['games'].sort(compareCountry));
    gamesSortCountry = gamesByDate['games'].sort(compareCountry)
    gamesSortCountry.forEach(game => {

        let tmpCountryId = game['country']['id']
    });
})()*/