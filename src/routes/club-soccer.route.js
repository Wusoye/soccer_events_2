module.exports = app => {
    const clubSoccer = require("../controllers/club-soccer.controller");

    let router = require("express").Router();

    router.get('/games-update', clubSoccer.gamesUpdate)

    router.get('/games-by-date/:strDate?', clubSoccer.gamesByDate)

    router.get('/games-by-id/:idGame', clubSoccer.gamesById)

    router.get('/games-by-team/:nameTeam', clubSoccer.gamesByTeam)

    router.get('/expected-goal-by-team/:nameTeam', clubSoccer.expGoaByTeam)

    router.get('/ema-expected-goal-by-team/:nameTeam/:periode', clubSoccer.eamExpGoaByTeam)

    app.use('/api/club-soccer', router);
}