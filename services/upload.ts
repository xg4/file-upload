import { chunk } from '@/utils/file'
import { create } from '@/utils/formData'
import md5 from '@/utils/md5'
import retry from 'async-retry'
import { compact } from 'lodash'

export default async function upload(file: File) {
  const chunks = chunk(file, 15 * 1024)

  const dirname = md5([chunks.length, file.name, file.type, file.size, file.lastModified].join('-'))

  const savedFiles: string[] = await fetch('/upload/start', {
    method: 'POST',
    body: JSON.stringify({
      dirname,
    }),
  }).then(r => r.json())

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

  await Promise.all(compact(list).map(uploadFile))

  return await fetch('/upload/end', {
    method: 'POST',
    body: JSON.stringify({
      dirname,
      type: file.type,
      total: list.length,
    }),
  })
    .then(r => r.json())
    .then(r => r.fileUrl)
}

function uploadFile(formData: FormData) {
  return retry(
    () =>
      fetch('/upload', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(20 * 1e3),
      }),
    {
      retries: 3,
    },
  )
}
