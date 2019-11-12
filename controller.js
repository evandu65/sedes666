const Vote = require('./models/vote');

class RankingController {
  async createNewVote(session, params) {

    const savedVote = await new Vote(params).save();

    // session.publish()

    return savedVote;
  }



}

exports.RankingController = RankingController;
exports.Ranking = Ranking;