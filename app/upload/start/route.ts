import { getUploadDir } from '@/utils/dir'
import { readdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

const formSchema = z.promise(
  z.object({
    dirname: z.string({
      invalid_type_error: 'Dirname must be a string',
      required_error: 'Dirname is required',
    }),
  }),
)

export async function POST(request: NextRequest) {
  try {
    const { dirname } = await formSchema.parse(request.json())
    const uploadDir = await getUploadDir(dirname)
    const files = await readdir(uploadDir)
    return NextResponse.json(files)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(err, { status: 400 })
    }
    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}
