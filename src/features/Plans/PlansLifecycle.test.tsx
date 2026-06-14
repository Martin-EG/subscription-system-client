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

const setSubscriptionState = (
  plans: Plan[],
  status: 'idle' | 'loading' | 'ready' | 'error',
  error: string | null,
) => {
  mockedUseAppSelector.mockImplementation((selector) =>
    selector({
      subscriptions: {
        plans,
        subscriptions: [],
        status,
        checkoutStatus: 'idle',
        error,
      },
    } as unknown as Parameters<typeof selector>[0]),
  );
};

describe('PlansLifecycle', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
    mockedUseAppDispatch.mockReturnValue(dispatch);
  });

  it('fetches plans and renders loading placeholders', () => {
    setSubscriptionState([], 'loading', null);

    const { container } = render(<PlansLifecycle />);

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('renders the error state when loading plans fails', () => {
    setSubscriptionState([], 'error', 'Plans unavailable.');

    render(<PlansLifecycle />);

    expect(screen.getByText('Plans error')).toBeInTheDocument();
  });

  it('renders the empty state when no plans are returned', () => {
    setSubscriptionState([], 'ready', null);

    render(<PlansLifecycle />);

    expect(screen.getByText('Plans empty state')).toBeInTheDocument();
  });

  it('renders available plans without fetching them again', () => {
    setSubscriptionState([plan], 'ready', null);

    render(<PlansLifecycle />);

    expect(screen.getByText('Plans content')).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
