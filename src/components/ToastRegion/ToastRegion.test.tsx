jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dismiss } from '@/store/notificationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import ToastRegion from './ToastRegion';

const mockedUseAppDispatch = jest.mocked(useAppDispatch);
const mockedUseAppSelector = jest.mocked(useAppSelector);

describe('ToastRegion', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
    mockedUseAppDispatch.mockReturnValue(dispatch);
  });

  it('renders an accessible live region when there are no notifications', () => {
    mockedUseAppSelector.mockReturnValue([]);

    const { container } = render(<ToastRegion />);

    const region = container.querySelector('[aria-live="polite"]');

    expect(region).toHaveAttribute('aria-relevant', 'additions');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders every notification with its title and message', () => {
    mockedUseAppSelector.mockReturnValue([
      {
        id: 'notification-1',
        title: 'Plan updated',
        message: 'Your Premium plan is active.',
        tone: 'success',
      },
      {
        id: 'notification-2',
        title: 'Payment failed',
        message: 'Please update your payment method.',
        tone: 'error',
      },
      {
        id: 'notification-3',
        title: 'Heads up',
        message: 'Your renewal is tomorrow.',
        tone: 'info',
      },
    ]);

    render(<ToastRegion />);

    expect(screen.getAllByRole('status')).toHaveLength(3);
    expect(screen.getByText('Plan updated')).toBeInTheDocument();
    expect(screen.getByText('Your Premium plan is active.')).toBeInTheDocument();
    expect(screen.getByText('Payment failed')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
  });

  it('dispatches dismiss for the selected notification', async () => {
    const user = userEvent.setup();
    mockedUseAppSelector.mockReturnValue([
      {
        id: 'notification-1',
        title: 'Plan updated',
        message: 'Your Premium plan is active.',
        tone: 'success',
      },
    ]);
    render(<ToastRegion />);

    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));

    expect(dispatch).toHaveBeenCalledWith(dismiss('notification-1'));
  });
});
