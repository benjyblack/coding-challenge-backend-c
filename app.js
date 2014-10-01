var express = require('express');
var app = express();
var url = require('url');
var port = process.env.PORT || 2345;

var data = require('./data');

data.addRecords(__dirname + '/data/cities_canada-usa.tsv')
	.then(function() {

		app.get('/suggestions', function(req, res) {
			var query = url.parse(req.url, true).query;

			var records = data.getSimilarRecords(query);
			
			if (records.length > 0)
				res.json({ suggestions: records });
			else
				res.status(404).send('No records found');
		});

		app.get('*', function(req, res) {
			res.status(404).send('Not found');
		});

		module.exports = app.listen(port, function() {
			console.log('Server running at http://127.0.0.1:%d/suggestions', port);
		});
	},
	function(err) {
		console.log(err);
});