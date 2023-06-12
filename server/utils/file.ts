import crypto from 'crypto'
import fs from 'fs'

function pipeStream(path: string, writeStream: fs.WriteStream) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(path)
    readStream.pipe(writeStream, { end: false })
    readStream.on('error', reject)
    readStream.on('end', resolve)
  })
}

export async function merge(files: string[], targetPath: string) {
  const writeStream = fs.createWriteStream(targetPath)
  for (const path of files) {
    await pipeStream(path, writeStream)
  }
}

export function md5(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(filePath)
    stream.on('data', hash.update)
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
    stream.on('error', reject)
  })
}
