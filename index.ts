import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
const PORT = process.env.SERVER_PORT || 8081

const server = http.createServer(app)
const io = new Server(server)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

const users = new Map<string, string>()

io.on('connection', (socket) => {
  socket.on('new_user', (user) => {
    users.set(socket.id, user)
    socket.broadcast.emit('new_user', user) // send to all clients
  })

  socket.on('message', ({ user, message }) => {
    socket.broadcast.emit('message', { user, message }) // send to all clients
  })

  socket.on('disconnect', () => {
    if (users.has(socket.id)) {
      socket.broadcast.emit('user_disconnected', users.get(socket.id))
      users.delete(socket.id)
    }
  })
})

server.listen(PORT, () => {
  console.log(`⚡️ Server listening on port ${PORT}`)
})
