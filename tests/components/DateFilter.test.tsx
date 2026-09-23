import { render, screen } from '@testing-library/react';
import { DateFilter } from '../../src/components/Filters/DateFilter';
import { FilterProvider } from '../../src/context/FilterContext';

test('renders Created date label', () => {
  render(
    <FilterProvider>
      <DateFilter />
    </FilterProvider>
  );
  const label = screen.getByText(/Created date/i);
  expect(label).toBeInTheDocument();
});
