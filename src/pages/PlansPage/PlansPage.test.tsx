jest.mock('@/features/Plans', () => ({
  PlansHeader: () => <div>Plans header</div>,
}));

jest.mock('@/features/Plans/PlansLifecycle', () => ({
  __esModule: true,
  default: () => <div>Plans lifecycle</div>,
}));

import { render, screen } from '@testing-library/react';

import PlansPage from './PlansPage';

describe('PlansPage', () => {
  it('renders the plans header and lifecycle content', () => {
    render(<PlansPage />);

    expect(screen.getByText('Plans header')).toBeInTheDocument();
    expect(screen.getByText('Plans lifecycle')).toBeInTheDocument();
  });
});
