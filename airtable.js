var Airtable = require('airtable');
var fs = require('fs');
var _ = require('lodash')
var Url = require('url')


Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'key5WsfVVzX20b9r4'
});
var base = Airtable.base('appNYMWxGF1jMaf5V');


function fetchOrgs() {
	var orgs = []

	base('Organizations').select({
	    // Selecting the first 3 records in Compact Grid:
	    maxRecords: 300,
	    view: "Capital Organizations"
	}).eachPage(function page(records, fetchNextPage) {
	    // This function (`page`) will get called for each page of records.

	    records.forEach(function(record) {
	    	const org = {title: record.get('Name'), website: record.get('Homepage')}
	    	orgs.push(org)
	    	console.log(org)
	    	fs.writeFileSync('./airtable.json', JSON.stringify(orgs, null, 2))
	    });

	    // To fetch the next page of records, call `fetchNextPage`.
	    // If there are more records, `page` will get called again.
	    // If there are no more records, `done` will get called.
	    fetchNextPage();

	}, function done(err) {
	    if (err) { console.error(err); return; }
	});

}

const getHost = o => Url.parse(o.website).host

function compareLists() {
	const climateList = require("./airtable.json")
	const amacia =require('./out')

	const intList = _.intersectionBy( amacia, climateList, getHost)
	const difList = _.differenceBy( amacia, climateList, getHost)

	console.log(intList.length, difList.length)
	// createOrgs(difList.slice(2,4))
}
compareLists()



function createOrgs(list) {
	const formatted = list.map(i => ({
		fields: {
			Name: i.title,
			Homepage: i.website,
			Source: "Amasia",
			Role: ["Capital"]
		}
	}))

	console.log(formatted)
	base('Organizations').create(formatted, function(err, records) {
	  if (err) {
	    console.error(err);
	    return;
	  }
	  records.forEach(function(record) {
	    console.log(record.get('Name'));
	  })
	});
}