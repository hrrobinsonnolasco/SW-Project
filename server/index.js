import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const PORT = process.env.PORT || 3001
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const app = express()
const httpServer = createServer(app)

const corsOptions = {
  origin: CLIENT_ORIGINS.length === 1 ? CLIENT_ORIGINS[0] : CLIENT_ORIGINS,
  methods: ['GET', 'POST'],
}

const io = new Server(httpServer, {
  cors: corsOptions,
})

app.use(cors(corsOptions))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const rooms = new Map()

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { emitter: null, receivers: new Set() })
  }
  return rooms.get(roomId)
}

function deleteRoomIfEmpty(roomId) {
  const room = rooms.get(roomId)
  if (!room) return

  if (!room.emitter && room.receivers.size === 0) {
    rooms.delete(roomId)
  }
}

function removeSocketFromRoom(socket) {
  const { roomId, role } = socket.data
  if (!roomId) return

  const room = rooms.get(roomId)
  if (!room) return

  if (role === 'emitter' && room.emitter === socket.id) {
    room.emitter = null
    socket.to(roomId).emit('stream-ended')
  } else if (role === 'receiver') {
    room.receivers.delete(socket.id)
  }

  deleteRoomIfEmpty(roomId)
}

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`)

  socket.on('join-room', ({ roomId, role }) => {
    if (!roomId || !role) return

    socket.join(roomId)
    socket.data.roomId = roomId
    socket.data.role = role

    const room = getRoom(roomId)

    if (role === 'emitter') {
      room.emitter = socket.id

      if (room.receivers.size > 0) {
        socket.emit('receiver-joined')
      }
    } else if (role === 'receiver') {
      room.receivers.add(socket.id)

      if (room.emitter) {
        io.to(room.emitter).emit('receiver-joined')
      }
    }

    console.log(`Socket ${socket.id} unido a sala ${roomId} como ${role}`)
  })

  socket.on('offer', ({ roomId, offer }) => {
    if (!roomId || !offer) return
    socket.to(roomId).emit('offer', { offer })
  })

  socket.on('answer', ({ roomId, answer }) => {
    if (!roomId || !answer) return
    socket.to(roomId).emit('answer', { answer })
  })

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    if (!roomId || !candidate) return
    socket.to(roomId).emit('ice-candidate', { candidate })
  })

  socket.on('stream-ended', ({ roomId }) => {
    if (!roomId) return
    socket.to(roomId).emit('stream-ended')
  })

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`)
    removeSocketFromRoom(socket)
  })
})

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de señalización en puerto ${PORT}`)
  console.log(`Orígenes permitidos: ${CLIENT_ORIGINS.join(', ')}`)
})
