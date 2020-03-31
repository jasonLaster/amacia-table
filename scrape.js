var rows = $$('[data-rowid]')
  .map(e => e.dataset.rowid)
  .slice(0,$$('[data-rowid]').length/2)

var columns = {
  title: 'fldfZW9kgnJO9PXnw',
  email: 'fld0NMjN2m8nEkvxQ',
  contact: 'fld4xLE7hKjNGveoc',
  website: 'fldKpTC5rAAgMzMgI',
  location: 'fldsC4T3chT5uxOoN',
  sector: 'fldGlybZFR3dHGKVV',
  stage: 'fldXbM1bIrfyEqrZF',
  description: 'fldves7MR7yGN2Ww2'
}

var colText = (row, col) => row.querySelector(`[data-columnid="${col}"]`)?.innerText

var scrapeCompany = (id) => {
  var [left, right] = [...$$(`[data-rowid="${id}"]`)]
  
  return {
    title: colText(left, columns.title),
    email: colText(right, columns.email),
    contact: colText(right, columns.contact),
    website: colText(right, columns.website),
    location: colText(right, columns.location),
    sector: colText(right, columns.sector),
    stage: colText(right, columns.stage),
    description: colText(right, columns.description),
   }
}


data = rows.map(id => scrapeCompany(id))
copy(data)

