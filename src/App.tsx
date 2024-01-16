import { createSignal, type Component} from 'solid-js'
import { cn } from './helper'
import Chat from './Chat'

const App: Component = () => {
  const [username, setUsername] = createSignal('')
  const [joined, setJoined] = createSignal(false)
  const [state, setState] = createSignal<0 | 1 | 2 | 3>(3)

  const join = () => {
    setJoined(true)
  }

  return (
    <div class='w-screen h-screen grid place-items-center bg-gradient-to-br from-slate-900 from-50% to-cyan-800/60'>
      <div class='flex flex-col items-center justify-center gap-6 w-full sm:w-3/5 lg:w-1/2 xl:w-2/5'>
        <div class='flex items-end gap-2'>
          <p class='text-6xl text-cyan-400 font-bold'>Solid Chat</p>
          <span
            title={stateTitle[state()]}
            class={cn('rounded-full w-4 h-4 inline-block mb-2', stateClass[state()])}
          ></span>
        </div>
        {joined() ? (
          <Chat username={username()} setState={setState} />
        ) : (
          <div class='rounded-xl overflow-hidden'>
            <input
              onKeyUp={(e) => e.key === 'Enter' && join()}
              placeholder={'your username'}
              class='outline-none bg-slate-200 text-slate-800 px-4 py-2'
              type='text'
              value={username()}
              onInput={(v) => setUsername(v.target.value)}
            />
            <button onClick={join} class='bg-cyan-600 px-4 py-2 text-slate-50 font-bold'>
              {'join'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
const stateClass = ['bg-amber-500', 'bg-emerald-500', 'bg-pink-500', 'bg-rose-500']
const stateTitle = ['Connecting', 'Open', 'Closing', 'Closed']

export default App
