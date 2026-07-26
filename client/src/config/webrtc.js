const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

function buildIceServers() {
  const servers = [...STUN_SERVERS]

  const turnUrl = import.meta.env.VITE_TURN_URL
  const turnUsername = import.meta.env.VITE_TURN_USERNAME
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL

  if (turnUrl && turnUsername && turnCredential) {
    const turnUrls = turnUrl.split(',').map((url) => url.trim()).filter(Boolean)
    servers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential,
    })
  }

  return servers
}

export const ICE_SERVERS = {
  iceServers: buildIceServers(),
}

export const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || undefined

export const DISPLAY_MEDIA_CONSTRAINTS = {
  video: true,
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
}
