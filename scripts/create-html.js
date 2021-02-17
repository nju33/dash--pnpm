const marked = require('marked')
const ejs = require('ejs')
const prism = require('prismjs')
const loadLanguages = require('prismjs/components/')
const fs = require('fs')
const path = require('path')
const grayMatter = require('gray-matter')
const { guideNames, cliNames } = require('./util')

loadLanguages(['bash', 'json', 'javascript', 'yaml'])

const renderer = {
  heading(text, level) {
    let type = 'Section'
    if (text.startsWith('--')) {
      type = 'Option'
    }

    let name = `//apple_ref/cpp/${type}/${'  '.repeat(level - 1)}${text}`
    if (text.endsWith('overview')) {
      name = `//apple_ref/cpp/Section/${text}`
    }

    return `
      <a name="${name}" class="dashAnchor">
        <h${level}>
          ${text}
        </h${level}>
      </a>
    `
  },
  link(href, title, text) {
    return `<a title="${title}" href="${href}.html">${text}</a>`
  }
}

marked.setOptions({
  highlight: function (code, _lang) {
    let lang = _lang
    if (lang === 'sh') {
      lang = 'bash'
    } else if (lang === 'text' && code.startsWith('pnpm')) {
      lang = 'bash'
    } else if (lang === 'text') {
      lang = 'none'
    }

    if (prism.languages[lang]) {
      return prism.highlight(
        code.replace(/&lt;/g, '<'),
        prism.languages[lang],
        lang
      )
    } else {
      return code
    }
  }
})

marked.use({ renderer })

const templateString = fs.readFileSync(
  path.join(__dirname, 'template.ejs'),
  'utf8'
)
const template = ejs.compile(templateString)

guideNames.forEach((name) => {
  const docPath = path.join(__dirname, '../docs', `${name}.md`)
  const {
    data: { title },
    content
  } = grayMatter(fs.readFileSync(docPath, 'utf8'))
  const contents = marked.parse(content)
  const outputPath = path.join(
    __dirname,
    `../pnpm.docset/Contents/Resources/Documents/${name}.html`
  )
  const html = template({ baseUrl: '.', title, html: contents })

  fs.writeFileSync(outputPath, html)
})

cliNames.forEach((name) => {
  const docPath = path.join(__dirname, '../docs/cli', `${name}.md`)
  const {
    data: { title },
    content
  } = grayMatter(fs.readFileSync(docPath, 'utf8'))
  const contents = marked.parse(content)
  const outputPath = path.join(
    __dirname,
    `../pnpm.docset/Contents/Resources/Documents/cli/${name}.html`
  )
  const html = template({
    baseUrl: '..',
    title: `cli / ${title}`,
    html: contents
  })

  fs.writeFileSync(outputPath, html)
})
