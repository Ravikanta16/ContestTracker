const Contest = require('../models/contests');

const addSolution = async (contestId, solutionLink) => {
    const contest = await Contest.findById(contestId);
    if(!contest){
        throw new Error('Contest not found');
    }
    contest.solutionLink = solutionLink;
    await contest.save();
    return contest;
}

module.exports = {addSolution};