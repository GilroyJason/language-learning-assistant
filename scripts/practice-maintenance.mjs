import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const practiceDir = path.join(projectRoot, 'practice-sets')
const configPath = path.join(practiceDir, '.config.json')

function loadConfig() {
  const defaults = {
    keepLatestPerSource: 30,
    maxTotalSets: 200,
    deleteOlderThanDays: 90
  }
  if (!fs.existsSync(configPath)) return defaults
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

function scanPracticeSets() {
  if (!fs.existsSync(practiceDir)) return []
  const entries = fs.readdirSync(practiceDir)
  const sets = []

  for (const entry of entries) {
    const entryPath = path.join(practiceDir, entry)
    const stat = fs.statSync(entryPath)
    if (!stat.isDirectory()) continue

    const files = fs.readdirSync(entryPath)
    const practiceJson = files.find(f => f.endsWith('_practice.json'))
    if (!practiceJson) continue

    const practicePath = path.join(entryPath, practiceJson)
    let practiceData = null
    try {
      practiceData = JSON.parse(fs.readFileSync(practicePath, 'utf-8'))
    } catch {
      continue
    }

    const audioFileName = practiceData?.audioFile || ''
    const modifiedTime = fs.statSync(practicePath).mtime
    const title = audioFileName ? path.parse(audioFileName).name : entry
    const source = entry

    sets.push({
      dir: entryPath,
      title,
      source,
      modifiedTime
    })
  }

  return sets.sort((a, b) => b.modifiedTime - a.modifiedTime)
}

function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) return
  fs.rmSync(dirPath, { recursive: true, force: true })
}

function main() {
  const config = loadConfig()
  const sets = scanPracticeSets()

  if (sets.length === 0) {
    console.log('No practice sets found.')
    return
  }

  const now = Date.now()
  const maxAgeMs = config.deleteOlderThanDays * 24 * 60 * 60 * 1000

  const toDelete = new Set()

  // Rule 1: delete older than days
  for (const s of sets) {
    if (config.deleteOlderThanDays > 0 && (now - s.modifiedTime.getTime()) > maxAgeMs) {
      toDelete.add(s.dir)
    }
  }

  // Rule 2: keep latest per source
  if (config.keepLatestPerSource > 0) {
    const bySource = new Map()
    for (const s of sets) {
      if (!bySource.has(s.source)) bySource.set(s.source, [])
      bySource.get(s.source).push(s)
    }
    for (const [source, list] of bySource.entries()) {
      list.sort((a, b) => b.modifiedTime - a.modifiedTime)
      list.slice(config.keepLatestPerSource).forEach(s => toDelete.add(s.dir))
    }
  }

  // Rule 3: global max total
  if (config.maxTotalSets > 0 && sets.length - toDelete.size > config.maxTotalSets) {
    const remaining = sets.filter(s => !toDelete.has(s.dir))
    remaining.sort((a, b) => b.modifiedTime - a.modifiedTime)
    remaining.slice(config.maxTotalSets).forEach(s => toDelete.add(s.dir))
  }

  let deleted = 0
  for (const dir of toDelete) {
    removeDir(dir)
    deleted += 1
  }

  console.log(`Maintenance complete. Deleted ${deleted} sets.`)
}

main()
