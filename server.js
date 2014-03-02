var browserify = require('browserify-middleware');
var express = require('express');
var app = express();

app.use('/app.js', browserify('./js/app.js'));
app.use("/", express.static(__dirname));

app.listen(3000);
