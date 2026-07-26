import { useCallback, useEffect, useRef } from 'react'
import { ICE_SERVERS } from '../config/webrtc'

function createPeerConnection(onIceCandidate, onTrack) {
  const pc = new RTCPeerConnection(ICE_SERVERS)

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate.toJSON())
    }
  }

  pc.ontrack = (event) => {
    onTrack(event.streams[0])
  }

  return pc
}

export function useWebRTC({ localStream, signaling, onRemoteStream, onConnectionStateChange }) {
  const pcRef = useRef(null)
  const pendingCandidatesRef = useRef([])

  const closePeerConnection = useCallback(() => {
    pendingCandidatesRef.current = []
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
  }, [])

  const flushPendingCandidates = useCallback(async (pc) => {
    const pending = pendingCandidatesRef.current
    pendingCandidatesRef.current = []

    for (const candidate of pending) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }, [])

  const addIceCandidate = useCallback(
    async (candidate) => {
      const pc = pcRef.current
      if (!pc || !candidate) return

      if (!pc.remoteDescription) {
        pendingCandidatesRef.current.push(candidate)
        return
      }

      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    },
    [],
  )

  const createOffer = useCallback(async () => {
    if (!localStream || !signaling) return

    closePeerConnection()

    const pc = createPeerConnection(
      (candidate) => signaling.emitIceCandidate(candidate),
      (stream) => onRemoteStream?.(stream),
    )

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    pc.onconnectionstatechange = () => {
      onConnectionStateChange?.(pc.connectionState)
    }

    pcRef.current = pc

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    signaling.emitOffer(offer)
  }, [localStream, signaling, closePeerConnection, onRemoteStream, onConnectionStateChange])

  const handleOffer = useCallback(
    async (offer) => {
      if (!signaling) return

      closePeerConnection()

      const pc = createPeerConnection(
        (candidate) => signaling.emitIceCandidate(candidate),
        (stream) => onRemoteStream?.(stream),
      )

      pc.onconnectionstatechange = () => {
        onConnectionStateChange?.(pc.connectionState)
      }

      pcRef.current = pc

      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      await flushPendingCandidates(pc)

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      signaling.emitAnswer(answer)
    },
    [signaling, closePeerConnection, flushPendingCandidates, onRemoteStream, onConnectionStateChange],
  )

  const handleAnswer = useCallback(
    async (answer) => {
      const pc = pcRef.current
      if (!pc) return

      await pc.setRemoteDescription(new RTCSessionDescription(answer))
      await flushPendingCandidates(pc)
    },
    [flushPendingCandidates],
  )

  useEffect(() => {
    return () => {
      closePeerConnection()
    }
  }, [closePeerConnection])

  return {
    createOffer,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    closePeerConnection,
  }
}
