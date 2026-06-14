jest.mock('@/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import { useAppSelector } from '@/store/hooks';

import DashboardHeader from './DashboardHeader';

const mockedUseAppSelector = jest.mocked(useAppSelector);

describe('DashboardHeader', () => {
  it('greets the user by their first name', () => {
    mockedUseAppSelector.mockReturnValue({
      id: 'user-1',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      role: 'USER',
    });

    render(<DashboardHeader />);

    expect(screen.getByRole('heading', { name: 'Good to see you, Ada.' })).toBeInTheDocument();
    expect(screen.getByText('LIVE UPDATES ON')).toBeInTheDocument();
  });

  it('uses a friendly fallback when the user has no name', () => {
    mockedUseAppSelector.mockReturnValue({
      id: 'user-1',
      email: 'user@example.com',
      name: null,
      role: 'USER',
    });

    render(<DashboardHeader />);

    expect(screen.getByRole('heading', { name: 'Good to see you, there.' })).toBeInTheDocument();
  });
});
