import '@testing-library/jest-dom'

Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  value: jest.fn(),
  writable: true,
})

afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  jest.mocked(fetch).mockReset()
  jest.restoreAllMocks()
  jest.useRealTimers()
})
