import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
  });

  it('renders as expected', () => {
    expect(screen.getByText('This page does not exist.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Return to dashboard' })).toHaveAttribute('href', '/');
  });
});
