import { getUploadDir } from '@/utils/dir'
import { readdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { object, string } from 'yup'

const formSchema = object({
  dirname: string().required(),
})

export async function POST(request: NextRequest) {
  const { dirname } = await formSchema.validate(await request.json())

  try {
    const uploadDir = await getUploadDir(dirname)
    const files = await readdir(uploadDir)
    return NextResponse.json(files)
  } catch (e) {
    console.error('Error while trying to upload a file\n', e)
  }
  return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
}
