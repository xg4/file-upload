import { merge } from '@/server/utils/file'
import { getUploadDir } from '@/utils/dir'
import { readdir, rm } from 'fs/promises'
import { map, sortBy } from 'lodash/fp'
import mime from 'mime'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 } from 'uuid'
import * as z from 'zod'

const formSchema = z.object({
  hash: z.string({
    invalid_type_error: 'Dirname must be a string',
    required_error: 'Dirname is required',
  }),
  type: z.string({
    invalid_type_error: 'Type must be a string',
    required_error: 'Type is required',
  }),
  total: z.number({
    invalid_type_error: 'Total must be a number',
    required_error: 'Total is required',
  }),
})

export async function POST(request: NextRequest) {
  try {
    const { hash, type, total } = await request.json().then(formSchema.parse)
    const uploadDir = await getUploadDir(hash)

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

    const filename = `${v4()}.${mime.getExtension(type)}`
    const filePath = path.join(path.parse(uploadDir).dir, filename)
    await merge(files, filePath)
    await rm(uploadDir, { recursive: true })
    const [, fileUrl] = filePath.split('/public')
    return NextResponse.json({ fileUrl })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(err, { status: 400 })
    }
    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}
