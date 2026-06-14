import { render, screen } from '@testing-library/react';

import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  beforeEach(() => {
    render(<NotFoundPage />)
  })

  it('renders as expected', () => {
    expect(screen.getByText('This page does not exist.')).toBeInTheDocument();
    expect(screen.findByRole('buttom', { name: 'Return to dashboard' })).toBeInTheDocument();
  });
});