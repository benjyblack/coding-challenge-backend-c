var toRadians = function(number) {
	return number * Math.PI / 180;
}

module.exports.haversineDistance = function(lat1, lon1, lat2, lon2) {
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


module.exports.clamp = function(x) {
	return Math.min(Math.max(x, 0), 1);
}