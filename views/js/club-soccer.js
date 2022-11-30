let graphHome = document.getElementById('graphHome')
let graphAway = document.getElementById('graphAway')
let tableHome = document.getElementById('tableHome')
let tableAway = document.getElementById('tableAway')
let tablePredictions = document.getElementById('tablePredictions')

let homeData = graphHome.getAttribute('data')
let awayData = graphAway.getAttribute('data')

const idGame = homeData.split(';')[0]
const team1 = homeData.split(';')[1]
const team2 = awayData.split(';')[1]

const PERIODE = 5
const PERIODE_BIS = 5

const SLICE = 10

const init = async () => {
    const thatGame = await Fetch.get('/api/club-soccer/games-by-id/'+idGame)
    const gamesHome = await Fetch.get('/api/club-soccer/games-by-team/'+team1)
    const gamesAway = await Fetch.get('/api/club-soccer/games-by-team/'+team2)


    
    
}


init()