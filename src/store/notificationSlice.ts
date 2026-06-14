import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  title: string
  message: string
  tone: 'success' | 'error' | 'info'
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: [] as Notification[],
  reducers: {
    notify: {
      reducer(state, action: PayloadAction<Notification>) {
        state.push(action.payload)
      },
      prepare(notification: Omit<Notification, 'id'>) {
        return { payload: { ...notification, id: nanoid() } }
      },
    },
    dismiss(state, action: PayloadAction<string>) {
      return state.filter((notification) => notification.id !== action.payload)
    },
  },
})

export const { notify, dismiss } = notificationSlice.actions
export const notificationReducer = notificationSlice.reducer
