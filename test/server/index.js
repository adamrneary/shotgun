var express   = require('express');
var http      = require('http');
var app       = express();
var bootstrap = require('../support/bootstrap').bootstrap;

app.set('port', process.env.PORT || 7358);
app.enable('jsonp callback');

app.get('/bootstrap.json', function(req, res) {
  res.jsonp(200, bootstrap.all(req.query.t));
});

app.get('/bootstrap2.json', function(req, res) {
  res.jsonp(200, {});
});

app.get('/change-data.json', function(req, res) {
  bootstrap.hasChange = true;
  res.jsonp(200, {});
});

app.get('/reseed.json', function(req, res) {
  bootstrap.hasReseed = true;
  res.jsonp(200, {});
});

app.get('/reset.json', function(req, res) {
  bootstrap.hasChange = false;
  bootstrap.hasReseed = false;
  res.jsonp(200, {});
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Fake activecell server started on port %d', app.get('port'));
});
