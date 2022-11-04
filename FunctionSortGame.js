let as = {
    a: [
        {
            date: moment('2022-11-04').format(),
            countryId: {
                name: 'country1',
                id: 1
            },
            leagueId: {
                name: 'league1',
                id: 1
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-11-04').format(),
            countryId: {
                name: 'country1',
                id: 1
            },
            leagueId: {
                name: 'league2',
                id: 2
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-11-02').format(),
            countryId: {
                name: 'country4',
                id: 4
            },
            leagueId: {
                name: 'league6',
                id: 6
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-10-24').format(),
            countryId: {
                name: 'country4',
                id: 4
            },
            leagueId: {
                name: 'league6',
                id: 6
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-10-30').format(),
            countryId: {
                name: 'country3',
                id: 3
            },
            leagueId: {
                name: 'league3',
                id: 3
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-11-10').format(),
            countryId: {
                name: 'country3',
                id: 3
            },
            leagueId: {
                name: 'league3',
                id: 3
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-10-11').format(),
            countryId: {
                name: 'country4',
                id: 4
            },
            leagueId: {
                name: 'league6',
                id: 6
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-10-20').format(),
            countryId: {
                name: 'country1',
                id: 1
            },
            leagueId: {
                name: 'league2',
                id: 2
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-09-14').format(),
            countryId: {
                name: 'country3',
                id: 3
            },
            leagueId: {
                name: 'league3',
                id: 3
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-09-15').format(),
            countryId: {
                name: 'country3',
                id: 3
            },
            leagueId: {
                name: 'league12',
                id: 12
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-09-05').format(),
            countryId: {
                name: 'country1',
                id: 1
            },
            leagueId: {
                name: 'league1',
                id: 1
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-09-26').format(),
            countryId: {
                name: 'country1',
                id: 1
            },
            leagueId: {
                name: 'league1',
                id: 1
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        },
        {
            date: moment('2022-10-11').format(),
            countryId: {
                name: 'country4',
                id: 4
            },
            leagueId: {
                name: 'league15',
                id: 15
            },
            game: {
                nameHome: 'fcle',
                nameAway: 'atleticole'
            }
        }
    ]

}


function compareLeague(a, b) {
    a = a['leagueId']['id']
    b = b['leagueId']['id']
    if (a < b) {
        return -1
    }
    if (a > b) {
        return 1
    }
    return 0
}


function compareCountry(a, b) {
    a = a['countryId']['id']
    b = b['countryId']['id']
    if (a < b) {
        return -1
    }
    if (a > b) {
        return 1
    }
    return 0
}

function compareDate(a, b){
    a = moment(a['date'])
    b = moment(b['date'])
    if (moment(a).isBefore(b)) {
        return -1
    }
    if (moment(a).isAfter(b)) {
        return 1
    }
    return 0
}

as = as['a'].sort(compareCountry)

let countryId = null
let countryName = null
let countryIdTmp = null
let countryNameTmp = null
let tabcountry = []
let tabcountryTmp = []

for(const indexA in as) {
    a = as[indexA]
    countryId = a['countryId']['id']
    countryName = a['countryId']['name']
    if (countryIdTmp === null || countryIdTmp !== countryId) {
        countryIdTmp !== null ? tabcountry.push({country: {id: countryIdTmp, name: countryNameTmp}, tabcountryTmp}) : null
        tabcountryTmp = []
        tabcountryTmp.push(a)
        countryIdTmp = countryId
        countryNameTmp = countryName
    } else {
        tabcountryTmp.push(a)
        countryIdTmp = countryId
        countryIdTmp = countryId
    }
}

tabcountry.push({country: {id: countryIdTmp, name: countryNameTmp}, tabcountryTmp})

let res = []
countryId = null
countryName = null
countryIdTmp = null
countryNameTmp = null

for(const indexCountry in tabcountry) {
    country = tabcountry[indexCountry]['tabcountryTmp'].sort(compareLeague)

    countryId = country[0]['countryId']['id']
    countryName = country[0]['countryId']['name']

    let leagueIdTmp = null
    let leagueId = null
    let leagueNameTmp = null
    let leagueName = null
    let tableague = []
    let tableagueTmp = []

    for(const indexA in country) {
        a = country[indexA]
        leagueId = a['leagueId']['id']
        leagueName = a['leagueId']['name']
        if (leagueIdTmp === null || leagueIdTmp !== leagueId) {
            leagueIdTmp !== null ? tableague.push({league: {id: leagueIdTmp, name: leagueNameTmp}, games: tableagueTmp.sort(compareDate)}) : null
            tableagueTmp = []
            tableagueTmp.push(a)
            leagueIdTmp = leagueId
            leagueNameTmp = leagueName
        } else {
            tableagueTmp.push(a)
            leagueIdTmp = leagueId
            leagueNameTmp = leagueName
        }
    }
    tableague.push({league: {id: leagueIdTmp, name: leagueNameTmp}, games: tableagueTmp.sort(compareDate)})
    res.push({country: {id: countryId, name: countryName}, league: tableague})
}

console.log(res);
