import { render, screen } from '@testing-library/react';
import { SpendTable } from '../../src/components/SpendTable';
import { useSpendData } from '../../src/hooks/useSpendData';

jest.mock('../../src/hooks/useSpendData');

const mockSpendItems = [
  {
    id: '1',
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    description: 'Test expense',
    amount: 100,
    category: 'Travel',
  },
];

(useSpendData as jest.Mock).mockReturnValue({ spendItems: mockSpendItems });

test('renders Created column header', () => {
  render(<SpendTable />);
  const header = screen.getByText(/Created/i);
  expect(header).toBeInTheDocument();
});
