const fs = require("fs")
const csv = require('csv')
const _ = require('lodash')
const Url = require('url')
// const generate = require('csv-generate')


const lists = [
	require('./european-accelerators.json').map(i => ({...i, type: "Accelerator"})),
	require('./european-vcs.json').map(i => ({...i, type: "Venture Capital"})),
	require('./southeast-asia-accelerator.json').map(i => ({...i, type: "Accelerator"})),
	require('./southeast-asia-vcs.json').map(i => ({...i, type: "Venture Capital"})),
	require('./us-accelerators.json').map(i => ({...i, type: "Accelerator"})),
	require('./us-vcs.json').map(i => ({...i, type: "Venture Capital"}))
]


const format = field => (field || "").replace(/\n/gm, ",")
const list = _.uniqBy([...lists].flat(), i => i.website)

const formattedList = list.map(o => ({
	...o,  
	location: format(o.location),
	sector: mapSectors(format(o.sector)),
	stage: mapStages(format(o.stage)),
	description: format(o.description)
}))


fs.writeFileSync('./out.json', JSON.stringify(formattedList, null, 2))



function printSectors() {
	const sectors = _.sortBy(_.uniq(list.map(i => i.sector.split("\n")).flat()))
	console.log(sectors.join("\n - "))

}

function printStages() {
	const sectors = _.sortBy(_.uniq(list.map(i => (i.stage || "").split("\n")).flat()))
	console.log(sectors.join("\n - "))
	
}

function mapSectors(sector) {
	const sectorMap = {
		"Agtech": "Agriculture",
		"Air": "Air",
		"Aquaculture": "Aquaculture",
		"Biofuels": "Biogas",
		"Carbon": "Carbon",
		"Chemicals": "Industrial",
		"Circular Economy" : "Waste",
		"Eclectic": "Energy",
		"Electricity": "Energy",
		"Energy": "Energy",
		"Food": "Food & Agriculture",
		"Forests": "Forestry",
		"Green Buildings": "Buildings & Cities",
		"Manufacturing": "Manufacturing",
		"Mobility": "Transportation",
		"Ocean": "Water",
		"Plastic Recycling": "Recycling",
		"Power": "Energy",
		"Recycling": "Recycling",
		"Smart Cities": "Building & Cities",
		"Smart Grid": "Smart Grid",
		"Solar": "Solar Photovoltaic",
		"Sustainable Cities": "Buildings & Cities",
		"Transit Tech": "Transportation",
		"Transportation": "Transportation",
		"Waste Management": "Waste",
		"Water": "Water",
	}
	return _.uniq(sector.split(",").map(s => sectorMap[s]).filter(Boolean)).join(",")
}


function mapStages(stage) {
	const stages = {
		"Pre-seed": "Pre-Seed",
		"Seed": "Seed",
		"Seed-stage": "Seed",
		"Series A": "Series A",
		"Early stage": "Pre-Seed, Seed",
		"Early-stage": "Pre-Seed, Seed",
		"Growth equity": "Series B, Series C+",
		"Growth stage": "Series B, Series C+",
		"Later Stage": "Series C+",
		"Mid-stage": "Series B",
		"Multi stage": "Series A, Series B, Series C+",
		"Multi-stage": "Series A, Series B, Series C+",
	}

	return _.uniq(stage.split(",").map(s => stages[s]).filter(i => i !== "" || undefined).join(", ").split(", ")).join(", ")
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
