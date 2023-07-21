import EventEmitter from 'eventemitter3'

export function monitorFrame() {
  return new Frame().request()
}

export default class Frame extends EventEmitter<{ change: (fps: number) => void }> {
  private frameCount = 0
  private lastTime?: number
  fps = 0
  private rafId?: number
  private interval = 1e3

  private monitor = (currentTime: number) => {
    if (!this.lastTime) {
      this.lastTime = currentTime
    }
    this.frameCount++
    const deltaTime = currentTime - this.lastTime

    if (deltaTime >= this.interval) {
      this.fps = this.frameCount / (deltaTime / this.interval)
      this.frameCount = 0
      this.lastTime = currentTime
      this.emit('change', this.fps)
    }

    this.rafId = requestAnimationFrame(this.monitor)
  }

  request() {
    this.frameCount = 0
    this.lastTime = undefined
    this.rafId = requestAnimationFrame(this.monitor)
    return this
  }

  cancel() {
    this.rafId && cancelAnimationFrame(this.rafId)
    return this
  }
}
