import { chunk } from '@/utils/file'
import { create } from '@/utils/formData'
import md5 from '@/utils/md5'
import ky from 'ky'
import { chunk as _chunk, compact } from 'lodash'

export default async function upload(file: File) {
  const chunks = chunk(file, 15 * 1024)

  const dirname = md5([chunks.length, file.name, file.type, file.size, file.lastModified].join('-'))

  const savedFiles = await ky
    .post('/upload/start', {
      json: {
        dirname,
      },
    })
    .json<string[]>()

  const getChunkName = (index: number) => [index, chunks.length].join('-').concat('.part')
  const list = chunks.map((blob, index) => {
    const filename = getChunkName(index + 1)
    if (savedFiles.includes(filename)) {
      return
    }
    return create({
      blob,
      filename,
      dirname: dirname,
    })
  })

  const files = _chunk(compact(list), 10)
  for (const chunk of files) {
    await Promise.all(chunk.map(uploadFile))
  }

  return await ky
    .post('/upload/end', {
      json: {
        dirname,
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
