jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import PlansError from './PlansError';

const mockedUseAppDispatch = jest.mocked(useAppDispatch);
const mockedUseAppSelector = jest.mocked(useAppSelector);

describe('PlansError', () => {
  it('shows the error and retries fetching plans', async () => {
    const user = userEvent.setup();
    const dispatch = jest.fn();
    mockedUseAppDispatch.mockReturnValue(dispatch);
    mockedUseAppSelector.mockReturnValue({
      plans: [],
      subscriptions: [],
      status: 'error',
      checkoutStatus: 'idle',
      error: 'The pricing service is unavailable.',
    });

    render(<PlansError />);

    expect(screen.getByText('The pricing service is unavailable.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
