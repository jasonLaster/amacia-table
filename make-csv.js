const fs = require("fs")
const csv = require('csv')
const _ = require('lodash')
// const generate = require('csv-generate')


const lists = [
	require('./european-accelerators.json'),
	require('./european-vcs.json'),
	require('./southeast-asia-accelerator.json'),
	require('./southeast-asia-vcs.json'),
	require('./us-accelerators.json'),
	require('./us-vcs.json')
]

const format = field => (field || "").replace(/,/gm, "").replace(/\n/gm, ",")
const list = _.uniqBy([...lists].flat(), i => i.website)

const formattedList = list.map(o => ({
	...o,  
	location: format(o.location),
	sector: format(o.sector),
	stage: format(o.stage),
	description: format(o.description)
}))


function printSectors() {
	const sectors = _.sortBy(_.uniq(list.map(i => i.sector.split("\n")).flat()))
	console.log(sectors.join("\n - "))

}

function printStages() {
	const sectors = _.sortBy(_.uniq(list.map(i => (i.stage || "").split("\n")).flat()))
	console.log(sectors.join("\n - "))
	
}


function printList() {
	const text = csv.stringify(formattedList,{
	  // header: true,
	  delimiter: '\t',
	  columns: [ 
		  { key: 'title' }, 
		  { key: 'website' },
		  { key: 'description' },
		  { key: 'location' }, 
		  { key: 'sector' },
		  { key: 'email' },
		  { key: "contact" },
		  { key: 'stage' },
	  ]
	}, function(err, data){
		console.log(data)
		fs.writeFileSync('./out.csv', data)
	})
}


// printStages()
