const express = require('express');
const router = express.Router();
const {addSolution} = require('../services/solution');

router.post('/addSolution', async (req, res) => {
    const {contestId, solutionLink} = req.body;
    const contest = await addSolution(contestId, solutionLink);
    res.json(contest);
});
module.exports=router;