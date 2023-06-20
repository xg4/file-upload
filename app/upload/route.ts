import { getUploadDir } from '@/utils/dir'
import bytes from 'bytes'
import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

const MAX_SIZE = 15 * 1024

const formSchema = z.object({
  dirname: z.string({
    invalid_type_error: 'Dirname must be a string',
    required_error: 'Dirname is required',
  }),
  filename: z.string({
    invalid_type_error: 'Filename must be a string',
    required_error: 'Filename is required',
  }),
  blob: z
    .instanceof(Blob, { message: 'Invalid file data' })
    .refine(b => b.size <= MAX_SIZE, { message: `File size greater than ${bytes(MAX_SIZE)}` }),
})

export async function POST(request: NextRequest) {
  try {
    const { dirname, filename, blob } = await request
      .formData()
      .then(f => f.entries())
      .then(Object.fromEntries)
      .then(formSchema.parse)

    const uploadDir = await getUploadDir(dirname)
    const buffer = Buffer.from(await blob.arrayBuffer())
    await writeFile(`${uploadDir}/${filename}`, buffer)

    return NextResponse.json('', { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(err, { status: 400 })
    }
    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}
