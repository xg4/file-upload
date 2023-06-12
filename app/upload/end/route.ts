import { merge } from '@/server/utils/file'
import { getUploadDir } from '@/utils/dir'
import { readdir, rm } from 'fs/promises'
import { map, sortBy } from 'lodash/fp'
import mime from 'mime'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 } from 'uuid'
import { number, object, string } from 'yup'

const formSchema = object({
  dirname: string().required(),
  type: string().required(),
  total: number().required(),
})

export async function POST(request: NextRequest) {
  const { dirname, type, total } = await formSchema.validate(await request.json())

  try {
    const uploadDir = await getUploadDir(dirname)

    const files = await readdir(uploadDir)
      .then(
        sortBy(filename => {
          const [index] = filename.split('-')
          return +index
        }),
      )
      .then(map(filename => path.join(uploadDir, filename)))

    if (files.length < total) {
      return NextResponse.json({ error: 'Missing files' }, { status: 400 })
    }

    const filename = `${dirname}-${v4()}.${mime.getExtension(type)}`
    const filePath = path.join(path.parse(uploadDir).dir, filename)
    await merge(files, filePath)
    await rm(uploadDir, { recursive: true })
    const [, fileUrl] = filePath.split('/public')
    return NextResponse.json({ fileUrl })
  } catch (e) {
    console.error('Error while trying to upload a file\n', e)
  }
  return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
}
