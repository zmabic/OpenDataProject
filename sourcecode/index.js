const express = require('express');
const path = require('path');
require('dotenv').config();
const { auth, requiresAuth } = require('express-openid-connect');

const apiRouter = require('./Controllers/api');
const datatableRouter = require('./Controllers/datatable')
const homeRouter = require('./Controllers/home');
const profileRouter = require('./Controllers/profile');

const app = express();

const port = 3000;


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENTID,
    issuerBaseURL: process.env.ISSUER
};
  
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(auth(config));
app.use('/Views/Data/', (req, res, next) => {
  if (req.oidc.isAuthenticated()) {
    return next();
  } else {
    return res.redirect('/login');
  }
});
app.use(express.static(__dirname));

app.use('/api', requiresAuth(), apiRouter);
app.use('/datatable', datatableRouter);
app.use('/profile', requiresAuth(), profileRouter);
app.use('/home', homeRouter);
app.use('/', homeRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
