
/*
 * Omitted due to time constraints:
 * - Build process to concat and compress files for production
 * - Routing so that you can deep link to specific logs
 */

//-----------------------------------------
// Events
//-----------------------------------------
$('.all-button').on('click', renderAllEndpoints);
$('.hw-button').on('click', function() {
	renderSingleEndpoint('hello-world');
});

$('.menu a').one('click', function() {
	$('.intro').fadeOut(function() {
		$('.content > *:not(.intro)').fadeIn('slow');
	});
});

// MDL's drawer does not close automatically on navigation.
$('.mdl-layout__drawer')[0].addEventListener('click', function() {
	$('.mdl-layout__obfuscator')[0].classList.remove('is-visible');
	this.classList.remove('is-visible');
}, false);


//-----------------------------------------
// Functions
//-----------------------------------------
function renderSingleEndpoint(endpoint) {
	$.getJSON('/api/v1/'+endpoint+'/logs', function(data) {


		// Add endpoint to each entry
		var entries = data.logs.map(function(entry) {
			entry.endpoint = endpoint;
			return entry;
		});

		renderRawTable(sortEntriesAsc(entries));
		renderAggregateTable(sortEntriesDesc(aggregate(entries)));
	});
}

function renderAllEndpoints() {
	$.getJSON('/api/v1/logs', function(data) {

		// Add the endpoint to each entry
		var allEntries = [];
		data.logset.forEach(function(endpointLogs) {
			allEntries = allEntries.concat(endpointLogs.logs.map(function(entry) {
				entry.endpoint = endpointLogs.endpoint;
				return entry;
			}));
		});

		renderRawTable(sortEntriesAsc(allEntries));
		renderAggregateTable(sortEntriesDesc(aggregate(allEntries)));
	});
}

// The raw log table
function renderRawTable(log) {
	var $log = $('.log tbody');
	$log.empty();

	log.forEach(function(entry) {
		var time = toHumanS(entry.timestamp);
		$log.append('<tr>' +
			'<td>'+entry.endpoint+'</td>' +
			'<td>'+entry.ip+'</td>' +
			'<td>'+entry.status+'</td>' +
			'<td>'+time+'</td>' +
			'</tr>'
		);
	});
}

// The minute aggregate table
function renderAggregateTable(log) {
	var $log = $('.aggregate tbody');
	$log.empty();

	log.forEach(function(entry) {
		$log.append('<tr>' +
			'<td>'+entry.count+'</td>' +
			'<td>'+entry.ip+'</td>' +
			'<td>'+toHumanM(entry.timestamp)+'</td>' +
			'</tr>'
		);
	});
}

// Groups up all requests that happened during a particular minute
function aggregate(log) {
	var minutes = {};
	var result = [];

	log.forEach(function(entry) {
		var minute = Math.floor(entry.timestamp / 60);
		if (!minutes[minute]) minutes[minute] = [entry];
		else minutes[minute].push(entry);
	});

	Object.keys(minutes).forEach(function(minute) {
		var entries = minutes[minute];
		result.push({
			count: entries.length,
			ip: entries[0].ip,
			timestamp: entries[0].timestamp
		});
	});

	return result;
}

//-----------------------------------------
// Helpers
//-----------------------------------------
function toHumanM(timestamp) {
	return toHuman(timestamp, 'YYYY-MM-DD, h:mm a');
}

function toHumanS(timestamp) {
	return toHuman(timestamp, 'YYYY-MM-DD, h:mm:ss a');
}

function toHuman(timestamp, format) {
	return moment.unix(timestamp).format(format);
}

function sortEntriesDesc(entries) {
	return entries.sort(function(a, b) {
		if (a.timestamp < b.timestamp) return 1;
		if (a.timestamp > b.timestamp) return -1;
		return 0;
	});
}

function sortEntriesAsc(entries) {
	return entries.sort(function(a, b) {
		if (a.timestamp > b.timestamp) return 1;
		if (a.timestamp < b.timestamp) return -1;
		return 0;
	});
}