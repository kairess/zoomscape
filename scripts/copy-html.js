import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFile, unlink } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sourceDir = resolve(__dirname, '../backend/static')
const targetDir = resolve(__dirname, '../backend/templates')

const htmlFiles = ['index.html']

async function copyFiles() {
  for (const file of htmlFiles) {
    try {
      await copyFile(join(sourceDir, file), join(targetDir, file))
      console.log(`${file} was copied to ${targetDir}`)
      
      // 원본 파일 삭제
      await unlink(join(sourceDir, file))
      console.log(`Original ${file} was deleted from static folder`)
    } catch (err) {
      console.error(`Error processing ${file}:`, err)
    }
  }
}

copyFiles()