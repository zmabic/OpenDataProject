const express = require('express');
const router = express.Router();
const path = require('path');
const data = require('../Models/dataManipulation');

router.get('/', (req, res) => {
    res.render(path.join(__dirname, '../Views/datatable.ejs'), {
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user,
    });
});

router.post('/submitForm', async (req, res) => {
    try {
        const attribute = req.body.attribute;
        const keyword = req.body.tekst;
        const result = await data.formQuery(attribute, keyword);
        if(!result.error) {
            res.json(result.data);
        } else {
            console.error('Error during search:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;