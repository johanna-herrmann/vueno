import { cp, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const builtDir = path.join(projectDir, 'dist')
const staticDirDev = path.resolve(projectDir, '../backend/static')
const staticDirBuild = path.resolve(projectDir, '../backend/dist/static')

await rm(staticDirDev, { recursive: true, force: true })
await rm(staticDirBuild, { recursive: true, force: true })
await mkdir(staticDirDev, { recursive: true })
await mkdir(staticDirBuild, { recursive: true })
await cp(builtDir, staticDirDev, { recursive: true })
await cp(builtDir, staticDirBuild, { recursive: true })
console.log(`Copied frontend build to ${staticDirDev}`)
console.log(`Copied frontend build to ${staticDirBuild}`)
