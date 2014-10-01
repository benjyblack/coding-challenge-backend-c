var csv = require('fast-csv');
var fs = require('fs');
var q = require('q');
var _ = require('lodash');

var mathHelper = require('./math-helper');

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

module.exports.getSimilarRecords = function(query) {
	var similarRecords = sortedRecords = [];

	_(records).forEach(function(record, index) {
		if (record.name.indexOf(query.q) != -1) {
	
			similarRecords.push({
				name: getFullLocationName(record),
				latitude: record.lat,
				longitude: record.long,
				score: evaluateRecord(query, record)
				// , distance: mathHelper.haversineDistance(record.lat, record.long, query.latitude, query.longitude)
			});
		}
	});

	// Sort records by score in descending order
	sortedRecords = _.sortBy(similarRecords, function(record) { return -(record.score); });

	return sortedRecords;
}

var evaluateRecord = function(query, record) {
	// Heuristics - proximity, population
	var proximityWeight = 0.8;
	var populationSizeWeight = 0.2;
	var score;

	// If location values are not provided, we add the proximity heuristic
	// and adjust accordingly
	if (typeof(query.latitude) === 'undefined' || typeof(query.longitude) === 'undefined') {
		proximityWeight = 0.0;
		populationSizeWeight = 1.0;

		score = evaluatePopulationSize(record.population) * populationSizeWeight;
	}
	else {
		score = evaluatePopulationSize(record.population) * populationSizeWeight 
			+ evaluateProximity(record.lat, record.long, query.latitude, query.longitude) * proximityWeight;
	}

	// Round to the nearest 1 decimal place
	return Math.round(score*10)/10;
}

var evaluatePopulationSize = function(population) {
	// after 1,000,000 people, all cities get a perfect score for population
	var upperBound = Math.pow(10,6);
	return mathHelper.clamp(population / upperBound);
}

var evaluateProximity = function(lat1, long1, lat2, long2) {
	// after 10,000km, all scores are 0	
	var upperBound = 10000;
	var distance = mathHelper.haversineDistance(lat1, long1, lat2, long2);

	return mathHelper.clamp(1.0 - (distance/upperBound));
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