import { cp, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const builtDir = path.join(projectDir, 'dist')
const staticDir = path.resolve(projectDir, '../src/main/resources/static')

await rm(staticDir, { recursive: true, force: true })
await mkdir(staticDir, { recursive: true })
await cp(builtDir, staticDir, { recursive: true })
console.log(`Copied frontend build to ${staticDir}`)
