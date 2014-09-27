var csv = require('fast-csv');
var fs = require('fs');

module.exports.addRecords = function(filename) {
	var records = [];
	var startDate = new Date();
	
	var stream = fs.createReadStream(filename);

	var csvStream = csv.parse({headers: true, delimiter: '\t', escape: '\\'})
		.on('data', function(data) {
			records.push(data);
		})
		.on('end', function() {
			console.log('Parsed ' + records.length + ' records in ' + (new Date() - startDate) + ' milliseconds');
		})
		.on('error', function(error) {
			console.log('Error parsing TSV file');
			console.log(error);
		});

	stream.pipe(csvStream);
}