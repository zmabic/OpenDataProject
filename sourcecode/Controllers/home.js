const express = require('express');
const router = express.Router();
const data = require('../Models/dataManipulation');
const path = require('path');

router.get('/', async (req, res) => {
    await data.setJsonResult("wildcard", "");
    await data.setCsvResult("wildcard", "");
    res.render(path.join(__dirname, '../Views/index.ejs'), {
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
    });
});

module.exports = router;