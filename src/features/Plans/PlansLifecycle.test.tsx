jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('./PlansContent', () => ({
  __esModule: true,
  default: () => <div>Plans content</div>,
}));

jest.mock('./PlansEmptyState', () => ({
  __esModule: true,
  default: () => <div>Plans empty state</div>,
}));

jest.mock('./PlansError', () => ({
  __esModule: true,
  default: () => <div>Plans error</div>,
}));

import { render, screen } from '@testing-library/react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Plan } from '@/types/models';

import PlansLifecycle from './PlansLifecycle';

const mockedUseAppDispatch = jest.mocked(useAppDispatch);
const mockedUseAppSelector = jest.mocked(useAppSelector);

const plan: Plan = {
  id: 'plan-1',
  name: 'Premium',
  price: 19.99,
  currency: 'USD',
  billingPeriod: 'MONTHLY',
};

describe('PlansLifecycle', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
    mockedUseAppDispatch.mockReturnValue(dispatch);
  });

  it('fetches plans and renders loading placeholders', () => {
    mockedUseAppSelector.mockReturnValue({
      plans: [],
      subscriptions: [],
      status: 'loading',
      checkoutStatus: 'idle',
      error: null,
    });

    const { container } = render(<PlansLifecycle />);

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('renders the error state when loading plans fails', () => {
    mockedUseAppSelector.mockReturnValue({
      plans: [],
      subscriptions: [],
      status: 'error',
      checkoutStatus: 'idle',
      error: 'Plans unavailable.',
    });

    render(<PlansLifecycle />);

    expect(screen.getByText('Plans error')).toBeInTheDocument();
  });

  it('renders the empty state when no plans are returned', () => {
    mockedUseAppSelector.mockReturnValue({
      plans: [],
      subscriptions: [],
      status: 'ready',
      checkoutStatus: 'idle',
      error: null,
    });

    render(<PlansLifecycle />);

    expect(screen.getByText('Plans empty state')).toBeInTheDocument();
  });

  it('renders available plans without fetching them again', () => {
    mockedUseAppSelector.mockReturnValue({
      plans: [plan],
      subscriptions: [],
      status: 'ready',
      checkoutStatus: 'idle',
      error: null,
    });

    render(<PlansLifecycle />);

    expect(screen.getByText('Plans content')).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
