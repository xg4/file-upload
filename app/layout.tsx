import './globals.css'

export const metadata = {
  title: 'File Upload',
  description: 'Example of segmented file upload',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
