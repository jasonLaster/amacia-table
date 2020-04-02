var Airtable = require("airtable");
var fs = require("fs");
var _ = require("lodash");
var Url = require("url");
// const airtableOrgs = require("./airtable.json")

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: "",
});
var base = Airtable.base("appNYMWxGF1jMaf5V");

function fetchOrgs() {
  var orgs = [];

  base("Organizations")
    .select({
      // Selecting the first 3 records in Compact Grid:
      maxRecords: 500,
      view: "Capital Organizations",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
          const org = {
            id: record.id,
            title: record.get("Name"),
            website: record.get("Homepage"),
            profile: record.get("Capital Profile"),
            source: record.get("Source")
          };
          orgs.push(org);
          console.log(org.title)
        });
        console.log(orgs.length)
        fs.writeFileSync("./airtable.json", JSON.stringify(orgs, null, 2));

        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

function fetchCategories() {
  var categories = {};

  base("Categories")
    .select({
      // Selecting the first 3 records in Compact Grid:
      maxRecords: 300,
      view: "All Categories",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function (record) {
          const cat = {
            id: record.id,
            Name: record.get("Name"),
          };
          // categories.push(cat);
          categories[cat.Name] = cat.id;
          // console.log(record.id, record.get("id"))

          // console.log(record.get("Capital Profile"))
          fs.writeFileSync(
            "./categories.json",
            JSON.stringify(categories, null, 2)
          );
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

const getHost = (o) => o.website && Url.parse(o.website).host;

function compareLists() {
  const climateList = require("./airtable.json").filter(i => i.source != "Amasia VC");
  const amacia = require("./out");

  const intList = _.intersectionBy(amacia, climateList, getHost);
  const difList = _.differenceBy(amacia, climateList, getHost);

  // createOrgs(difList);
  // console.log(difList.length)
  createProfiles(difList)
}

async function createOrgs(list) {
  const categories = require("./categories.json");
  const formatted = list.map((i) => ({
    fields: {
      Name: i.title,
      Homepage: i.website,
      Categories: i.sector
        .split(",")
        .map((cat) => categories[cat])
        .filter(c => c != null),
      Source: "Amasia VC",
      Role: ["Capital"],
      // data: {"amasia vc": i.data}
    },
  }));

  // console.log(JSON.stringify(formatted));
  // return;
  // console.log(formatted.length)
  // return
  const chunks = _.chunk(formatted, 10);
  for (const chunk of chunks) {
    await new Promise((resolve) => {
      base("Organizations").create(chunk, function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          console.log(record.get("Name"));
        });
        resolve()
      });
    });
  }

  // const formattedProfile = list.map(i => ({
  // 	fields: {
  // 		// Name: i.title,
  // 		Organization: i.title,
  // 		Type: i.type,
  // 		Stage: i.stages
  // 	}
  // }))
}

async function createClimateProfiles() {
  const climateList = require("./airtable.json");
  const needProfiles = climateList.filter((cl) => !cl.profile);
  console.log(climateList.length, needProfiles.length);

  const list = needProfiles.map((cl) => ({
    fields: {
      Organization: [cl.id],
    },
  }));
  // console.log(JSON.stringify(list))
  const chunks = _.chunk(list, 10);
  for (const chunk of chunks) {
    await new Promise((resolve) => {
      console.log(
        `>> creating profiles`,
        chunk.map((c) => c.fields.Organization)
      );
      base("Capital Profiles").create(chunk, function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          console.log(record.get("Name"));
        });
        resolve();
      });
    });
  }
}

async function createProfiles(list) {
  const airtableOrgs = require("./airtable.json")
  const profileList = list.map((cl) => {
    const id = airtableOrgs.find(o => o.title == cl.title).id
    return {
      fields: {
        Organization: [id],
        Type: [cl.type],
        Stage: cl.stage.split(", ").filter(i => i != "")
      }
    }
  })

  console.log(JSON.stringify(profileList, null, 2))
  // return;
  // console.log(profileList)
  const chunks = _.chunk(profileList, 10);
  for (const chunk of chunks) {
    await new Promise((resolve) => {
      console.log(
        `>> creating profiles`,
        chunk.map((c) => c.fields.Organization)
      );
      base("Capital Profiles").create(chunk, function (err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          console.log(record.get("Name"));
        });
        resolve();
      });
    });
  }
}


(function () {
  // createProfiles()
  compareLists();
  // fetchOrgs()
  // fetchCategories()
})();
