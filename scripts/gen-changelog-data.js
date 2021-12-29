const fs = require('fs-extra')
const path = require('path')
const { marked } = require('marked')

const OUT_PATH = path.join(__dirname, '../demo/changelogData.json')
const TYPE_LEVEL = 3 // ### Feats
const TITLE_LEVEL = 2 // ## 1.0.0

const CHANGE_TYPES = new Set([
  'Feats',
  'Fixes',
  'Breaking Changes',
  'Refactors',
  'Performance Improvements',
  'Chores',
  'i18n',
  'Deprecated',
  'Perf'
])

function readFile (filename) {
  return fs.readFileSync(path.join(__dirname, filename), { encoding: 'utf-8' })
}

function getComponent (line) {
  const reg = /(?<=[`])n-\w+/g
  const result = reg.exec(line)
  const component = result ? result[0] : ''
  return component
}

function getChangeLog (line) {
  const changeLogReg = /\s*-\s*(.*)/
  const changeLog = changeLogReg.exec(line)[1]
  return changeLog.trim()
}

function getTitleLevel (line) {
  // 行内 #
  if (!line.startsWith('#')) return 0
  const result = line.match(/#/g)
  return result ? result.length : 0
}

function getVersion (line) {
  const versionReg = /.*((\d{1,2}\.){2}\d{1,2}(-\w+\.\d+)?)/
  const result = versionReg.exec(line)
  return result ? result[1].trim().toLowerCase() : ''
}

function getLogType (line) {
  let type = line.replace(/#/g, '').trim()
  if (!CHANGE_TYPES.has(type)) {
    type = 'Other'
  }
  return type
}

function getChangeLogList (rawMarkdown) {
  const lines = rawMarkdown.split('\n')
  if (!lines.length === 0) return []
  let version
  let type
  const output = []

  lines.forEach((line) => {
    const titleLevel = getTitleLevel(line)
    if (titleLevel === TITLE_LEVEL) {
      version = getVersion(line)
    }
    if (titleLevel === TYPE_LEVEL) {
      type = getLogType(line)
    }
    if (version && /\s*-\s*.*/.test(line)) {
      const component = getComponent(line)
      const content = getChangeLog(line)
      console.log('content', content)
      const contentToHTML = marked(content)
        .replace(/(<p>)|(<\/p>)/g, '')
        .trim()
      const currentChangeLog = {
        version,
        type,
        component,
        content: contentToHTML
      }
      output.push(currentChangeLog)
    }
  })
  return output
}

function genChangelogVersionData () {
  try {
    const changelogZN = readFile('../CHANGELOG.zh-CN.md')
    const changelogEN = readFile('../CHANGELOG.en-US.md')
    const changelogZNList = getChangeLogList(changelogZN)
    const changelogENList = getChangeLogList(changelogEN)
    const changelogJSON = {
      'zh-CN': changelogZNList,
      'en-US': changelogENList
    }
    fs.writeFileSync(OUT_PATH, JSON.stringify(changelogJSON))
    console.info(`🎉 save changeLog.json to ${OUT_PATH}`)
  } catch (err) {
    console.error('changelog build error: ', err.message, err.stack)
  }
}

genChangelogVersionData()
