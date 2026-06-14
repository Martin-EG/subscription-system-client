jest.mock('@/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import { useAppSelector } from '@/store/hooks';

import DashboardError from './DashboardError';

const mockedUseAppSelector = jest.mocked(useAppSelector);

describe('DashboardError', () => {
  it('shows the subscription error and recovery context', () => {
    mockedUseAppSelector.mockReturnValue({
      subscriptions: [],
      plans: [],
      status: 'error',
      checkoutStatus: 'idle',
      error: 'The service is unavailable.',
    });

    render(<DashboardError />);

    expect(screen.getByText('We could not refresh your subscription.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'The service is unavailable. Your last known session remains available.',
      ),
    ).toBeInTheDocument();
  });
});
