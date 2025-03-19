const express = require('express');
const router = express.Router();
const {register, login} = require('../services/auth');

router.post('/register', async (req, res) => {
    const {name, email, password, type  } = req.body;
    const user = await register(name, email, password, type);
    res.json(user);
});

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await login(email, password);
    res.json(user);
});

module.exports = router;