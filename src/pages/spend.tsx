import React from 'react';
import { FilterProvider } from '../context/FilterContext';
import { DateFilter } from '../components/Filters/DateFilter';
import { SpendTable } from '../components/SpendTable';

const SpendPage: React.FC = () => {
  return (
    <FilterProvider>
      <div className="spend-page">
        <h1>Spend</h1>
        <DateFilter />
        <SpendTable />
      </div>
    </FilterProvider>
  );
};

export default SpendPage;
