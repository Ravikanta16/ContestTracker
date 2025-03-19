const Leetcode = require('./crawlers/Leetcode');
const Codeforces = require('./crawlers/CodeForces');
const express = require('express');
const cors = require('cors');
// const Codechef = require('./crawlers/CodeChef');
const authRouter = require('./controller/auth');
const bookmarkRouter = require('./controller/bookmark');
const leetcode = new Leetcode(10);
const Contest = require('./models/contests');
const mongoose = require('mongoose');
const contestsRouter = require('./controller/contests');
const solutionRouter = require('./controller/solution');

mongoose.connect('mongodb://localhost:27017/contestmgmt', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const allContests = [];
// (async () => {
//     await leetcode.init();
//     console.log(leetcode.contests,leetcode.contests.length);
// })();

// const codeforces = new Codeforces(10);
// (async () => {
//     await codeforces.init();
//     console.log(codeforces.contests,codeforces.contests.length);
// })();



async function setup() {
    const leetcode = new Leetcode(10);
    await leetcode.init();
    console.log(leetcode.contests,leetcode.contests.length);
    allContests.push(...leetcode.contests);
    const codeforces = new Codeforces(10);
    await codeforces.init();
    console.log(codeforces.contests,codeforces.contests.length);
    allContests.push(...codeforces.contests);
    await Contest.deleteMany({});
    for(const contest of allContests){
    const contestModel = new Contest({
        name: contest.name,
        date: contest.date,
        platform: contest.platform,
        link: contest.link,
        solutionLink: contest.solutionLink
    });
    await contestModel.save();
   }
}

setup();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/contests', contestsRouter);
app.use('/auth', authRouter);
app.use('/bookmark', bookmarkRouter);
app.use('/solution', solutionRouter);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// const codechef = new Codechef(10);
// (async () => {
//     await codechef.init();
//     console.log(codechef.contests,codechef.contests.length);
// })();

// leetcode.scrapeContestList();