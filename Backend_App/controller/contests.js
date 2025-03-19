const express = require('express');
const router = express.Router();
const {getAllContests}=require('../services/contests');
const {getPastContests}=require('../services/contests');
const {getUpcomingContests} = require('../services/contests');
const {getContestsByPlatform} = require('../services/contests');

router.get('/all', async (req, res) => {
    const contests = await getAllContests();
    res.json(contests);
});

router.get('/getByPlatform', async (req, res) => {
    const {platform} = req.query;
    const contests = await getContestsByPlatform(platform);
    res.json(contests);
});

router.get('/getPast', async (req, res) => {
    const {platform} = req.query;
    const contests = await getPastContests(platform);
    res.json(contests);
});

router.get('/getUpcoming', async (req, res) => {
    const {platform} = req.query;
    const contests = await getUpcomingContests(platform);
    res.json(contests);
});

module.exports = router;
