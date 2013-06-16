var express = require('express');
var http    = require('http');
var app     = express();
var data    = require('../support/data');

app.set('port', process.env.PORT || 7358);

app.get('/bootstrap.json', function(req, res) {
  res.json(200, data.bootstrap(req.query.t));
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Fake activecell server started on port %d', app.get('port'));
});
