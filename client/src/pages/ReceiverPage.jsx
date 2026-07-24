import { useParams } from 'react-router-dom'
import { useRef } from 'react'

export default function ReceiverPage() {
  const { id } = useParams()
  const videoRef = useRef(null)

  return (
    <div className="min-h-svh bg-black text-white">
      <div className="relative flex min-h-svh items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="max-h-svh w-full object-contain"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-none">
          <div className="text-center">
            <p className="text-sm uppercase tracking-widest text-slate-400">Esperando transmisión</p>
            <p className="mt-2 text-lg font-medium text-white">Sala: {id}</p>
            <p className="mt-1 text-sm text-slate-500">
              El video aparecerá aquí cuando el emisor inicie la transmisión.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
