import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSignaling } from '../hooks/useSignaling'
import { useWebRTC } from '../hooks/useWebRTC'

export default function ReceiverPage() {
  const { id } = useParams()
  const videoRef = useRef(null)
  const webrtcActionsRef = useRef({})

  const [remoteStream, setRemoteStream] = useState(null)
  const [connectionState, setConnectionState] = useState('connecting')
  const [streamEnded, setStreamEnded] = useState(false)

  const handleRemoteStream = useCallback((stream) => {
    setRemoteStream(stream)
    setStreamEnded(false)
    setConnectionState('connected')
  }, [])

  const handleStreamEnded = useCallback(() => {
    setRemoteStream(null)
    setStreamEnded(true)
    setConnectionState('ended')
    webrtcActionsRef.current.closePeerConnection?.()

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const signaling = useSignaling({
    roomId: id,
    role: 'receiver',
    enabled: !!id,
    handlers: {
      onOffer: (offer) => {
        webrtcActionsRef.current.handleOffer?.(offer)
      },
      onIceCandidate: (candidate) => {
        webrtcActionsRef.current.addIceCandidate?.(candidate)
      },
      onStreamEnded: handleStreamEnded,
    },
  })

  const webrtc = useWebRTC({
    role: 'receiver',
    localStream: null,
    signaling,
    onRemoteStream: handleRemoteStream,
    onConnectionStateChange: (state) => {
      if (state === 'connected') setConnectionState('connected')
      if (state === 'connecting') setConnectionState('connecting')
      if (state === 'failed' || state === 'disconnected') setConnectionState('failed')
    },
  })

  webrtcActionsRef.current = webrtc

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const waiting = !remoteStream && !streamEnded

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

        {waiting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-sm uppercase tracking-widest text-slate-400">
                Esperando transmisión
              </p>
              <p className="mt-2 text-lg font-medium text-white">Sala: {id}</p>
              <p className="mt-1 text-sm text-slate-500">
                El video aparecerá aquí cuando el emisor inicie la transmisión.
              </p>
            </div>
          </div>
        )}

        {streamEnded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-lg font-medium text-white">Transmisión finalizada</p>
              <p className="mt-2 text-sm text-slate-400">
                El emisor detuvo la transmisión.
              </p>
            </div>
          </div>
        )}

        {connectionState === 'failed' && !remoteStream && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300">
            Error de conexión. Recarga la página para reintentar.
          </div>
        )}
      </div>
    </div>
  )
}
