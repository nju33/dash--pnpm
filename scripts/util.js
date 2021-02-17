const path = require('path')
const fs = require('fs')

const docsDir = path.join(__dirname, '../docs')
const cliDir = path.join(docsDir, 'cli')

exports.guideNames = fs
  .readdirSync(docsDir)
  .filter((name) => {
    return fs.statSync(path.join(docsDir, name)).isFile()
  })
  .map((filename) => path.basename(filename, '.md'))
exports.cliNames = fs
  .readdirSync(cliDir)
  .map((filename) => path.basename(filename, '.md'))
