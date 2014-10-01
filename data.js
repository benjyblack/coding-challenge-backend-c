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

module.exports.getSimilarRecords = function(query) {
	var similarRecords = sortedRecords = [];

	_(records).forEach(function(record, index) {
		if (record.name.indexOf(query.q) != -1) {
	
			similarRecords.push({
				name: getFullLocationName(record),
				latitude: record.lat,
				longitude: record.long,
				score: evaluateRecord(query, record)
			});
		}
	});

	// Sort records by score in descending order
	sortedRecords = _.sortBy(similarRecords, function(record) { return -(record.score); });

	return sortedRecords;
}

// TODO: This, better
var evaluateRecord = function(query, record) {
	// Heuristics - proximity, population, character match
	var proximityWeight = 0.0;
	var populationSizeWeight = 0.9;
	var characterMatchWeight = 0.1;

	var proximityScore = 0.0;

	// If location values are provided, we add the proximity heuristic
	// and adjust the others accordingly
	if (typeof(query.latitude) !== 'undefined' && typeof(query.longitude) !== 'undefined') {
		proximityWeight = 0.6;
		populationSizeWeight = 0.3;
		characterMatchWeight = 0.1;
	
		// Proximity
		var distance = haversineDistance(record.lat, record.long, query.latitude, query.longitude);
		
		if (distance < 25) proximityScore = 1.0;
		else if (distance < 500) proximityScore = 0.7;
		else if (distance < 1000) proximityScore = 0.4;
		else proximityScore = 0.0;

		proximityScore *= proximityWeight;
	}

	// Population size
	var threshold = Math.pow(10,6);
	var populationRatio = Math.min(record.population / threshold, 1.0); 
	var populationSizeScore = populationRatio * populationSizeWeight;

	// Character match
	var fullName = getFullLocationName(record);
	var percentOfChars = query.q.length/fullName.length;
	var characterMatchScore = percentOfChars * characterMatchWeight;

	var score = characterMatchScore + populationSizeScore + proximityScore;

	return Math.round(score*10)/10;
}

var haversineDistance = function(lat1, lon1, lat2, lon2) {
	var R = 6371; // km
	var φ1 = toRadians(lat1);
	var φ2 = toRadians(lat2);
	var Δφ = toRadians(lat2-lat1);
	var Δλ = toRadians(lon2-lon1);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	return R * c;
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

var toRadians = function(number) {
	return number * Math.PI / 180;
}