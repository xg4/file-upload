export function createFormData(data: Record<string, string | Blob | number | boolean>) {
  const formData = new FormData()
  Object.keys(data).map(key => {
    const value = data[key]
    if (value instanceof Blob) {
      formData.append(key, value)
    } else {
      formData.append(key, value.toString())
    }
  })
  return formData
}
