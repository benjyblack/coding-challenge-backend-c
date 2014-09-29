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
			
			similarRecords.push({
				name: getFullLocationName(record),
				latitude: record.lat,
				longitude: record.long,
				score: 0
			});
		}
	});

	return similarRecords;
}

var getFullLocationName = function(record) {
	var country = record.country === 'US' ? 'USA' : 'Canada';
	var admin1 = record.country === 'US' ? record.admin1 : fipsToProvince(record.admin1);

	return record.name + ', ' + admin1 + ', ' + country;
}

var fipsToProvince = function(code) {
	switch(+code) {
		case 1: return "AB";
		case 2: return "BC";
		case 3: return "MB";
		case 4: return "NB";
		case 5: return "NL";
		case 7: return "NS";
		case 8: return "ON";
		case 9: return "PE";
		case 10: return "QC";
		case 11: return "SK";
		case 12: return "YT";
		case 13: return "NT";
		case 14: return "NU";
	}

	return "Invalid code";
}