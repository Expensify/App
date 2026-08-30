// In src/pages/Report/DistanceEditStep.tsx
// Fix: Only validate rate if it's user-editable; skip validation for auto-populated rates

const validateRate = (rate: string | number): boolean => {
  // If rate is null/undefined and not editable (e.g., auto-populated), treat as valid
  if (rate == null && !isRateEditable) {
    return true;
  }
  
  // Otherwise, perform standard validation
  const rateValue = Number(rate);
  return !isNaN(rateValue) && rateValue > 0;
};

// In the submit handler
const handleSubmit = useCallback(() => {
  // ... other validation logic ...
  
  // Only validate rate if it's editable; otherwise assume default rate is valid
  if (isRateEditable && !validateRate(rate)) {
    setError('Rate not valid');
    return;
  }
  
  // ... proceed with submission ...
}, [isRateEditable, rate, /* other deps */]);

// Ensure isRateEditable is properly set based on expense type and policy settings
const isRateEditable = useMemo(() => {
  // Rate is non-editable for distance expenses using default rates
  return report?.type === 'expense' && !isDefaultDistanceRate;
}, [report, isDefaultDistanceRate]);