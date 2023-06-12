import { getUploadDir } from '@/utils/dir'
import { writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { ValidationError, mixed, object, string } from 'yup'

const formSchema = object({
  dirname: string().required(),
  filename: string().required(),
  blob: mixed<Blob>()
    .required('File blob is required.')
    .test('isBlob', 'Invalid file format', value => value instanceof Blob)
    .test('maxSize', 'File size is too large', value => value && value.size <= 15 * 1024),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request
      .formData()
      .then(f => f.entries())
      .then(Object.fromEntries)
    const { dirname, filename, blob } = await formSchema.validate(formData)
    const uploadDir = await getUploadDir(dirname)
    const buffer = Buffer.from(await blob.arrayBuffer())
    await writeFile(`${uploadDir}/${filename}`, buffer)

    return NextResponse.json('', { status: 201 })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    console.error('Error while trying to upload a file\n', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
