let context = ''

let logFunc = (func: (...args: any[]) => void) => {
  return (...args: any[]) => {
    func(context + ':', ...args)
  }
}
export const logger = {
  setContext: (ctx: string) => {
    context = ctx
  },
  log: logFunc(console.log),
  error: logFunc(console.error),
  warn: logFunc(console.warn),
  info: logFunc(console.info),
  debug: logFunc(console.debug),
}