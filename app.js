var express = require('express');
var app = express();
var port = process.env.PORT || 2345;

// Initialize data from tsv
var data = require('./data');
data.addRecords(__dirname + '/data/cities_canada-usa.tsv');

app.get('/suggestions', function(req, res) {
	res.json({ suggestions: [] });
});

app.get('*', function(req, res) {
	res.status(404).send('Not found');
});


module.exports = app.listen(port, function() {
	console.log('Server running at http://127.0.0.1:%d/suggestions', port);
});