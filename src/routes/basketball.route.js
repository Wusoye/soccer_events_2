module.exports = app => {
    const basketball = require("../controllers/basketball.controller");

    let router = require("express").Router();

    router.get('/games-by-date/:strDate', basketball.gameByDate)

    router.get('/games-by-range-date/:startDate/:endDate', basketball.gameByRangeDate)
    
    router.get('/games-by-id/:idGame', basketball.gameById)

    router.get('/games-by-team/:idTeam', basketball.gameByTeam)

    router.get('/ema-by-team/:idTeam/:dateGame', basketball.emaByTeam)

    app.use('/api/basketball', router);
}