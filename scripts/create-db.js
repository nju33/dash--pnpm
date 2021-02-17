const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const path = require('path')
const { guideNames, cliNames } = require('./util')

const dbFilePath = path.join(
  __dirname,
  '../pnpm.docset/Contents/Resources/docSet.dsidx'
)
try {
  fs.unlinkSync(dbFilePath)
} catch {}
const db = new sqlite3.Database(dbFilePath)

db.serialize(() => {
  db.run(
    'CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)'
  )
  db.run('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path);')

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES (?, ?, ?)'
  )
  guideNames.forEach((name) => {
    stmt.run(name, 'Guide', `${name}.html`)
  })
  cliNames.forEach((name) => {
    stmt.run(name, 'Command', `cli/${name}.html`)
  })
  stmt.finalize()
})

db.close()
