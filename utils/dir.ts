import dayjs from 'dayjs'
import { mkdir, stat } from 'fs/promises'
import path from 'path'

export async function getUploadDir(dirname: string) {
  const uploadDir = path.join(process.cwd(), 'public/uploads/', dayjs().format('DD-MM-YYYY'), dirname)
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
