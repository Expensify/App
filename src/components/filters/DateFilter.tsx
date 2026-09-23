import React from 'react';
import { useFilterContext } from '../../context/FilterContext';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

export const DateFilter: React.FC = () => {
  const { dateRange, setDateRange } = useFilterContext();

  return (
    <div className="filter-item">
      {/* Updated label from "Date" to "Created date" */}
      <label htmlFor="created-date-filter" className="filter-label">
        Created date
      </label>
      <DateRangePicker
        id="created-date-filter"
        startDate={dateRange.startDate}
        startDateId="start_date_id"
        endDate={dateRange.endDate}
        endDateId="end_date_id"
        onDatesChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
        focusedInput={dateRange.focusedInput}
        onFocusChange={(focusedInput) => setDateRange({ ...dateRange, focusedInput })}
        numberOfMonths={1}
        isOutsideRange={() => false}
        showClearDates
      />
    </div>
  );
};
