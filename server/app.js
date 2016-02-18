"use strict";
const express = require('express');
const app = express();
const webpackMiddleware = require('./webpackMiddleware');

app.use(webpackMiddleware);
app.use('/', express.static('public'));
app.listen(3000, () => console.log('app listening on port 3000!'));

module.exports = app;

