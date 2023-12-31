type MethodKey = 'readAsArrayBuffer' | 'readAsDataURL' | 'readAsText' | 'readAsBinaryString'

export function reader(blob: Blob, key: MethodKey) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader[key](blob)
  })
}

export function chunk(blob: Blob, chunkSize = 15 * 1024) {
  let offset = 0
  const chunks: Blob[] = []
  while (offset < blob.size) {
    const b = blob.slice(offset, offset + chunkSize) // 切割文件为一个文件块
    chunks.push(b)
    offset += chunkSize
  }
  return chunks
}
