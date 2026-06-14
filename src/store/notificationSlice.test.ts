import {
  dismiss,
  notificationReducer,
  notify,
  type Notification,
} from '@/store/notificationSlice';

describe('notificationSlice', () => {
  it('creates a notification with a generated id', () => {
    const action = notify({
      title: 'Subscription updated',
      message: 'Your new plan is active.',
      tone: 'success',
    });

    expect(action.payload).toEqual({
      id: expect.any(String),
      title: 'Subscription updated',
      message: 'Your new plan is active.',
      tone: 'success',
    });
    expect(action.payload.id).not.toHaveLength(0);
    expect(notificationReducer(undefined, action)).toEqual([action.payload]);
  });

  it('dismisses only the selected notification', () => {
    const notifications: Notification[] = [
      {
        id: 'notification-1',
        title: 'First',
        message: 'First message',
        tone: 'info',
      },
      {
        id: 'notification-2',
        title: 'Second',
        message: 'Second message',
        tone: 'error',
      },
    ];

    const state = notificationReducer(notifications, dismiss('notification-1'));

    expect(state).toEqual([notifications[1]]);
  });

  it('leaves state unchanged when the notification does not exist', () => {
    const notifications: Notification[] = [
      {
        id: 'notification-1',
        title: 'Notice',
        message: 'A useful message.',
        tone: 'info',
      },
    ];

    expect(notificationReducer(notifications, dismiss('missing'))).toEqual(notifications);
  });
});
