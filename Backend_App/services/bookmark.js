const User = require('../models/user');
const Contest = require('../models/contests');

const bookmarkContest = async (userId, contestId) => {
    const user = await User.findById(userId);
    const contest = await Contest.findById(contestId);
    if(!user || !contest){
        throw new Error('User or contest not found');
    }
    user.bookmarkedContests.push(contestId);
    await user.save();
    return user;
}

const unbookmarkContest = async (userId, contestId) => {
    const user = await User.findById(userId);
    user.bookmarkedContests = user.bookmarkedContests.filter(id => id.toString() !== contestId);
    await user.save();
    return user;
}

const getBookmarkedContests = async (userId) => {
    console.log(userId);
    const user = await User.findById(userId);
    // if (!user) {
    //     throw new Error("User not found");
    // }

    // if (!user.bookmarkedContests || user.bookmarkedContests.length === 0) {
    //     return []; // Return an empty array if no bookmarked contests exist
    // }
    const contests = await Contest.find({id: {$in: user.bookmarkedContests}});
    return contests;
}

module.exports = {bookmarkContest, unbookmarkContest, getBookmarkedContests};