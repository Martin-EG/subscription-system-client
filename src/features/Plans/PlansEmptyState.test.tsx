import { render, screen } from '@testing-library/react';

import PlansEmptyState from './PlansEmptyState';

describe('PlansEmptyState', () => {
  it('explains that subscription plans are not currently available', () => {
    render(<PlansEmptyState />);

    expect(
      screen.getByRole('heading', { name: 'No plans are available yet.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We are preparing new subscription options/i),
    ).toBeInTheDocument();
  });
});
