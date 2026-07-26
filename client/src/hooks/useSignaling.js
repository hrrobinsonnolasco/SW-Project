import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { SIGNALING_URL } from '../config/webrtc'

export function useSignaling({ roomId, role, enabled, handlers }) {
  const socketRef = useRef(null)
  const handlersRef = useRef(handlers)

  handlersRef.current = handlers

  useEffect(() => {
    if (!enabled || !roomId || !role) return

    const socket = io(SIGNALING_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join-room', { roomId, role })
    })

    socket.on('receiver-joined', () => {
      handlersRef.current?.onReceiverJoined?.()
    })

    socket.on('offer', ({ offer }) => {
      handlersRef.current?.onOffer?.(offer)
    })

    socket.on('answer', ({ answer }) => {
      handlersRef.current?.onAnswer?.(answer)
    })

    socket.on('ice-candidate', ({ candidate }) => {
      handlersRef.current?.onIceCandidate?.(candidate)
    })

    socket.on('stream-ended', () => {
      handlersRef.current?.onStreamEnded?.()
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomId, role, enabled])

  function emitOffer(offer) {
    socketRef.current?.emit('offer', { roomId, offer })
  }

  function emitAnswer(answer) {
    socketRef.current?.emit('answer', { roomId, answer })
  }

  function emitIceCandidate(candidate) {
    socketRef.current?.emit('ice-candidate', { roomId, candidate })
  }

  function emitStreamEnded() {
    socketRef.current?.emit('stream-ended', { roomId })
  }

  return { emitOffer, emitAnswer, emitIceCandidate, emitStreamEnded }
}
