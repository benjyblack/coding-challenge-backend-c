var csv = require('fast-csv');
var fs = require('fs');
var q = require('q');
var _ = require('lodash');

var records = [];

module.exports.addRecords = function(filename) {
	var deferred = q.defer();
	var startDate = new Date();
	
	var stream = fs.createReadStream(filename);

	var csvStream = csv.parse({headers: true, delimiter: '\t', escape: '\\'})
		.on('data', function(data) {
			records.push(data);
		})
		.on('end', function() {
			console.log('Parsed ' + records.length + ' records in ' + (new Date() - startDate) + ' milliseconds');

			deferred.resolve();
		})
		.on('error', function(error) {
			console.log('Error parsing TSV file');
			console.log(error);
		});

	stream.pipe(csvStream);

	return deferred.promise;
}

module.exports.getSimilarRecords = function(input) {
	var similarRecords = [];

	_(records).forEach(function(record, index) {
		if (record.name.indexOf(input) != -1) {
			similarRecords.push(record);
		}
	});

	return similarRecords;
}