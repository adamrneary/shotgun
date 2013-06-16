var express = require('express');
var http    = require('http');
var app     = express();

app.set('port', process.env.PORT || 7358);
app.get('/bootstrap.json', function(req, res) {
  res.json(200, []);
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Fake activecell server started on port %d', app.get('port'));
});
