const Contest = require('../models/contests');

const getAllContests = async () => {
    const contests = await Contest.find();
    return contests;
}

const getPastContests = async (platform) => {
    const query = { date: { $lt: new Date() } };

    if (platform && platform !== "All") {
        query.platform = platform;
    }

    const contests = await Contest.find(query);
    return contests;
};

// const getPastContests = async (platform) => {
//     const contests = await Contest.find({ date: { $lt: new Date() } });
//     return contests;
// };

const getUpcomingContests = async (platform) => {
    const query = { date: { $gt: new Date() } };

    if (platform && platform !== "All") {
        query.platform = platform;
    }

    const contests = await Contest.find(query);
    return contests;
};

// const getUpcomingContests = async (platform) => {
//     const contests = await Contest.find({date: {$gt: new Date()}});
//     return contests;
// }

const getContestsByPlatform = async (platform) => {
    const contests = await Contest.find({platform});
    return contests;
}

module.exports = {getAllContests, getUpcomingContests, getPastContests, getContestsByPlatform};