import { render, screen } from '@testing-library/react';

import DashboardEmptyState from './DashboardEmptyState';

describe('DashboardEmptyState', () => {
  it('explains that the account is ready for a subscription', () => {
    render(<DashboardEmptyState />);

    expect(
      screen.getByRole('heading', { name: 'Your premium chapter starts here.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Your account is ready for a subscription.')).toBeInTheDocument();
  });
});
