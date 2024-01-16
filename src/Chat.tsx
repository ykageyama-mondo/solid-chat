import {makeHeartbeatWS, makeReconnectingWS, createWSState} from '@solid-primitives/websocket'
import {type Component, createSignal, onMount, createEffect, onCleanup, For} from 'solid-js'
import {createStore} from 'solid-js/store'
import {logger} from '../common/logger'
import type {TextMessage, Message, JoinMessage, LeaveMessage} from '../common/types'
import {cn} from './helper'

const Chat: Component<{ username: string; setState: (state: 0 | 1 | 2 | 3) => void }> = (props) => {
  const [input, setInput] = createSignal('')
  const [messages, setMessages] = createStore<TextMessage[]>([])
  const [onlineUsers, setOnlineUsers] = createSignal<string[]>([])

  const ws = makeHeartbeatWS(makeReconnectingWS('ws://localhost:8080'), {
    interval: 1000 * 60,
  })

  onMount(() => {
    ws.send(JSON.stringify({ type: 'join', data: props.username }))
  })

  ws.addEventListener('message', (e): void => {
    if (e.data === 'pong') return
    const message = JSON.parse(e.data) as Message | Message[]

    logger.log('message', message)
    if (Array.isArray(message)) {
      const grouped = message.reduce(
        (acc, m) => {
          switch (m.type) {
            case 'join':
              acc['join'].push(m)
              break
            case 'leave':
              acc['leave'].push(m)
              break
            case 'text':
              acc['text'].push(m)
              break
          }
          return acc
        },
        {
          text: [] as TextMessage[],
          join: [] as JoinMessage[],
          leave: [] as LeaveMessage[],
        }
      )
      if (grouped.text.length) {
        setMessages((m) => [...m, ...grouped.text])
        logger.log('text messages', grouped.text.length)
      }
      if (grouped.join.length) {
        setOnlineUsers((u) => [...u, ...grouped.join.map((m) => m.userName)])
        logger.log('online users', grouped.join.length)
      }
      return
    }
    switch (message.type) {
      case 'join':
        setOnlineUsers((u) => [...u, message.userName])
        return
      case 'leave':
        setOnlineUsers((u) => u.filter((u) => u !== message.userName))
        return
      case 'text':
        setMessages(messages.length, message)
        return
    }
  })
  const state = createWSState(ws)
  createEffect(() => props.setState(state()))
  createEffect(() => logger.log('online users', onlineUsers()))

  onCleanup(() => {
    ws.send(JSON.stringify({ type: 'leave', data: props.username }))
    ws.close()
  })

  const sendMessage = () => {
    if (!input()) return
    ws.send(JSON.stringify({
      type: 'message',
      data: input()
    }))
    setInput('')
  }

  return (
    <>
      <div class='rounded-xl overflow-hidden'>
        <input
          onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={'message'}
          class='outline-none bg-slate-200 text-slate-800 px-4 py-2'
          type='text'
          value={input()}
          onInput={(v) => setInput(v.target.value)}
        />
        <button onClick={sendMessage} class='bg-cyan-600 px-4 py-2 text-slate-50 font-bold'>
          {'send'}
        </button>
      </div>
      <div class='max-h-[50vh] overflow-auto flex flex-col gap-2 w-full px-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-thumb-rounded-md'>
        <For each={messages}>{(message) => <MessageItem message={message} online={onlineUsers().includes(message.userName)}/>}</For>
      </div>
    </>
  )
}

const MessageItem: Component<{ message: TextMessage, online: boolean }> = (props) => {
  return (
    <div class='cursor-default justify-center items-center flex gap-2 w-full bg-slate-700/20 px-2 py-4 rounded-xl backdrop-blur-md drop-shadow-md'>
      <p class='text-lg ml-4 flex-grow text-slate-100 font-bold'>{props.message.text}</p>
      <div class='text-sm text-slate-300 flex flex-col items-end'>
        <div
          title={props.online ? 'online' : 'offline'}
          class='flex items-center'
        >
          <p>{props.message.userName}</p>
          <span
            class={cn('rounded-full w-2 h-2 inline-block ml-[4px]', props.online ? 'bg-emerald-500' : 'bg-rose-500')}
          ></span>
        </div>
        <p class='font-bold'>{new Date(props.message.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  )
}

export default Chat