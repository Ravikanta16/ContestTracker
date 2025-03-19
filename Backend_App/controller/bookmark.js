const express = require('express');
const router = express.Router();
const {bookmarkContest, unbookmarkContest, getBookmarkedContests} = require('../services/bookmark');

router.post('/bookmark', async (req, res) => {
    const {userId, contestId} = req.body;
    const user = await bookmarkContest(userId, contestId);
    res.json(user);
});

router.post('/unbookmark', async (req, res) => {
    const {userId, contestId} = req.body;
    const user = await unbookmarkContest(userId, contestId);
    res.json(user);
});

router.get('/bookmarked', async (req, res) => {
    const {userId} = req.query;
    const contests = await getBookmarkedContests(userId);
    res.json(contests);
});

module.exports = router;