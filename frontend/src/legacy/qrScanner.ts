import QrScanner from '../vendor/qr-scanner.min.js'
import { handleQrScanResult } from './runtime'

export function initializeQrScanner(): void {
  const background = document.getElementById('qrScanBg') as HTMLDivElement
  const video = document.getElementById('qrScanVideo') as HTMLVideoElement
  const startButton = document.getElementById('qrScanBtn') as HTMLButtonElement
  const stopButton = document.getElementById('qrScanStopBtn') as HTMLButtonElement

  QrScanner.WORKER_PATH = '/res/js/qr/qr-scanner-worker.min.js'
  const scanner = new QrScanner(video, (result: string) => {
    handleQrScanResult(result)
    stop()
  }, (error: Error) => console.log(error))

  void QrScanner.hasCamera().then((hasCamera: boolean) => {
    const app = (window as any).app
    if (app) app.hasCamera = hasCamera
  })

  function start(): void {
    background.style.display = 'block'
    video.style.display = 'block'
    stopButton.style.display = 'block'
    void scanner.start()
  }

  function stop(): void {
    background.style.display = 'none'
    video.style.display = 'none'
    stopButton.style.display = 'none'
    scanner.stop()
  }

  startButton.addEventListener('click', start)
  stopButton.addEventListener('click', stop)
}
