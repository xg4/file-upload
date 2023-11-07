import Frame from '@/utils/frame'
import { useEffect, useState } from 'react'

export default function MonitorFrame() {
  const [state, setState] = useState(0)

  useEffect(() => {
    const f = new Frame()
    f.on('change', setState)
    f.request()
    return () => {
      f.off('change', setState)
      f.cancel()
    }
  }, [])

  return <div>fps:{Math.floor(state)}</div>
}
