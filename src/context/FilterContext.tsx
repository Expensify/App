import React, { createContext, useContext, useState } from 'react';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  focusedInput: 'startDate' | 'endDate' | null;
}

interface FilterContextProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

const FilterContext = createContext<FilterContextProps | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
    focusedInput: null,
  });

  return (
    <FilterContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};
