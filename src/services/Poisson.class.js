function fact(nbr) {
    var i, nbr, f = 1;
    for (i = 1; i <= nbr; i++) {
        f = f * i;   // ou f *= i;
    }
    return f;
}

class Poisson {
    constructor(homeExpGoal, awayExpGoal, maxGoalDist) {
        this.homeExpGoal = homeExpGoal
        this.awayExpGoal = awayExpGoal
        this.maxGoalDist = maxGoalDist

        this.homeDistrib = []
        this.awayDistrib = []
        this.matriceGoalDistrib = {}

        for (let i = 0; i <= maxGoalDist; i++) {
            let kFact = fact(i)

            let local = Math.exp(-this.homeExpGoal) * (Math.pow(this.homeExpGoal, i) / kFact)
            let visitor = Math.exp(-this.awayExpGoal) * (Math.pow(this.awayExpGoal, i) / kFact)

            this.homeDistrib.push(local)
            this.awayDistrib.push(visitor)

        }
    }

    predict_goals(probPercent) {
        if (probPercent) {
            return [homeDistrib, awayDistrib]
        } else {
            for (let k = 0; k < maxGoalDist; k++) {
                homeDistrib[k] = homeDistrib[k] * 100
                awayDistrib[k] = awayDistrib[k] * 100
            }
            return [homeDistrib, awayDistrib]
        }
    }

    predict_proba() {

        home_prob = 0
        draw_prob = 0
        away_prob = 0

        for (let local_i = 0; local_i < homeDistrib.length; local_i++) {
            for (let visitor_i = 0; visitor_i < awayDistrib.length; visitor_i++) {

                local_prob_score = homeDistrib[local_i]
                visitor_prob_score = awayDistrib[visitor_i]
                

                if (local_i > visitor_i) {
                    home_prob = local_prob_score * visitor_prob_score + home_prob
                }
                if (local_i == visitor_i) {
                    draw_prob = local_prob_score * visitor_prob_score + draw_prob
                }
                if (local_i < visitor_i) {
                    away_prob = local_prob_score * visitor_prob_score + away_prob
                }

                if (local_i <= 5 && visitor_i <= 5) {
                    score = String(local_i + '-' + visitor_i)
                    matriceGoalDistrib[score] = local_prob_score * visitor_prob_score
                }

            }
        }

        matriceGoalDistrib['proba'] = [home_prob, draw_prob, away_prob]
        matriceGoalDistrib['percent'] = [home_prob * 100, draw_prob * 100, away_prob * 100]
        return matriceGoalDistrib

    }

    show_distrib() {
        console.log("local: ", homeDistrib, "visitor: ", awayDistrib);
    }


}