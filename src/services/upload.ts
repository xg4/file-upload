import { chunkFile, hashFile } from '@/utils/file'
import { createFormData } from '@/utils/formData'
import ky from 'ky'
import { compact } from 'lodash'
import pLimit from 'p-limit'

const LIMIT_SIZE = 15 * 1024

const LIMIT_COUNT = 10

const limit = pLimit(LIMIT_COUNT)

export default async function upload(file: File) {
  const chunks = chunkFile(file, LIMIT_SIZE)

  const hash = hashFile(file)

  const savedFiles = await ky
    .post('/upload/start', {
      json: {
        hash,
      },
    })
    .json<string[]>()

  const list = chunks.map((blob, index) => {
    const filename = [index + 1, chunks.length].join('-')
    if (savedFiles.includes(filename)) {
      return
    }
    return createFormData({
      blob,
      filename,
      hash,
    })
  })

  await Promise.all(compact(list).map(formData => limit(uploadFile, formData)))

  return await ky
    .post('/upload/end', {
      json: {
        hash,
        type: file.type,
        total: list.length,
      },
    })
    .json<{ fileUrl: string }>()
    .then(r => r.fileUrl)
}

function uploadFile(formData: FormData) {
  return ky
    .post('/upload', {
      body: formData,
      signal: AbortSignal.timeout(20 * 1e3),
    })
    .json()
}
