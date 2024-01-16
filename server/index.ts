import {WebSocketServer} from 'ws'
import {logger} from '../common/logger'
import {Message, RawMessage} from '../common/types'
import {randomUUID} from 'crypto'
const wss = new WebSocketServer({port: 8080})

logger.setContext('wss')
const messages: Message[] = []
const connectedUsers = new Set<string>()

logger.info('Starting server')

wss.on('connection', ws => {
  const onlineUsers = Array.from(connectedUsers).map(userName => ({
    type: 'join',
    userName,
  }))
  ws.send(JSON.stringify([...messages, ...onlineUsers]))
  logger.info('New connection')
  if (!ws) return
  let userName = 'Anonymous'

  ws.on('message', (data) => {
    const str = data.toString()
    logger.info('New message: ', str)
    if (str === 'ping') return ws.send('pong')

    const raw = JSON.parse(str) as RawMessage

    if (raw.type === 'message') {
      const message: Message = {
        text: raw.data,
        id: randomUUID(),
        timestamp: Date.now(),
        userName,
        type: 'text',
      }
      messages.push(message)
      logger.info(`Sending message to all ${wss.clients.size} clients`, JSON.stringify(message))
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(message))
        }
      })
      return
    }

    if (raw.type === 'join') {
      userName = raw.data
      logger.info(`New user joined: ${userName}`)
      connectedUsers.add(raw.data)
    } else if (raw.type === 'leave') {
      connectedUsers.delete(raw.data)
      logger.info(`User left: ${raw.data}`)
    }
    logger.info(`Sending message to all ${wss.clients.size} clients`)
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: raw.type,
          userName: raw.data,
        }))
      }
    })

  })

  ws.on('close', () => {
    logger.info('Connection closed')
    if (userName === 'Anonymous') return
    connectedUsers.delete(userName)
    logger.info(`Sending message to all ${wss.clients.size} clients`)
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'leave',
          userName,
        }))
      }
    })
  })
})