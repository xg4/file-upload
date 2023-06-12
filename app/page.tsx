'use client'

import upload from '@/services/upload'
import retry from 'async-retry'
import Image from 'next/image'
import { useState } from 'react'

export default function Home() {
  const [urls, setUrls] = useState<string[]>([])
  return (
    <main className="container mx-auto flex flex-col items-center space-y-10 pt-10">
      <input
        name="file"
        type="file"
        accept="image/*"
        onChange={async evt => {
          const files = evt.target.files
          if (!files) {
            return
          }
          for (const file of Array.from(files)) {
            const url = await retry(() => upload(file), {
              retries: 3,
            })
            setUrls(p => (p ? [...p, url] : [url]))
          }
          evt.target.value = ''
        }}
      />

      {urls.map(url => (
        <Image width={200} height={200} className="object-contain" key={url} src={url} alt=""></Image>
      ))}
    </main>
  )
}
