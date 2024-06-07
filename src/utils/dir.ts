import { mkdir, stat } from 'fs/promises'
import path from 'path'

export async function getUploadDir(hash: string) {
  const uploadDir = path.resolve(process.cwd(), 'public/uploads/', hash)
  try {
    await stat(uploadDir)
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      await mkdir(uploadDir, { recursive: true })
    } else {
      throw new Error('Error while trying to create directory when uploading a file')
    }
  }

  return uploadDir
}
