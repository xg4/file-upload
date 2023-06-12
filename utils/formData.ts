export function create(data: Record<string, string | Blob | number | boolean>) {
  const formData = new FormData()
  Object.entries(data).map(([key, value]) => {
    if (value instanceof Blob) {
      formData.append(key, value)
    } else {
      formData.append(key, value + '')
    }
  })
  return formData
}
