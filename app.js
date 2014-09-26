var express = require('express');
var app = express();
var port = process.env.PORT || 2345;

app.get('/suggestions', function(req, res) {
	res.json({ suggestions: [] });
});

app.get('*', function(req, res) {
	res.status(404).send('Not found');
});

var server = app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:%d/suggestions', port);
});