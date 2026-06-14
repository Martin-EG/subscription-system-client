const { TextDecoder, TextEncoder } = require('node:util')

Object.defineProperties(globalThis, {
  TextDecoder: {
    configurable: true,
    value: TextDecoder,
    writable: true,
  },
  TextEncoder: {
    configurable: true,
    value: TextEncoder,
    writable: true,
  },
})
