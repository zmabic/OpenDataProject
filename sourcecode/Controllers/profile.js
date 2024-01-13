const express = require('express');
const router = express.Router();
const path = require('path');
const data = require('../Models/dataManipulation');

router.get('/', (req, res) => {
    console.log(req.oidc.user);
    res.render(path.join(__dirname, '../Views/profile.ejs'), {
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
    });
});


module.exports = router;