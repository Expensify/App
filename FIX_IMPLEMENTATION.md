# Expensify PR #85553 - RBR Expense Carousel Sort Fix

## Issue
Expense carousel doesn't show RBR-actionable expenses first. RBR-flagged expenses can be buried at position 5+ in the carousel, making them easy to miss.

## Root Cause
No RBR-aware sorting in the transaction display path:
1. Carousel does `transactions.slice(0, 11)` with no sort beforehand
2. Transaction list sorts by date/column only

## Solution

### File 1: MoneyRequestReportPreviewContent.tsx

**Location**: Line 506

**Current Code**:
```typescript
const carouselTransactions = useMemo(() => (shouldShowAccessPlaceHolder ? [] : transactions.slice(0, 11)), [shouldShowAccessPlaceHolder, transactions]);
```

**Fixed Code**:
```typescript
const carouselTransactions = useMemo(() => {
    if (shouldShowAccessPlaceHolder) {
        return [];
    }
    
    // Sort RBR-flagged transactions to the front before slicing
    const sortedTransactions = [...transactions].sort((a, b) => {
        const aHasRBR = a.hasRBR ?? false;
        const bHasRBR = b.hasRBR ?? false;
        return (bHasRBR ? 1 : 0) - (aHasRBR ? 1 : 0);
    });
    
    return sortedTransactions.slice(0, 11);
}, [shouldShowAccessPlaceHolder, transactions]);
```

### File 2: MoneyRequestReportTransactionList.tsx

**Location**: Line 269-271

**Current Code**:
```typescript
const sortedTransactions: TransactionWithOptionalHighlight[] = useMemo(() => {
    return [...transactions].sort((a, b) => compareValues(getTransactionValue(a, sortBy, report), getTransactionValue(b, sortBy, report), sortOrder, sortBy, localeCompare, true));
}, [sortBy, sortOrder, transactions, localeCompare, report]);
```

**Fixed Code**:
```typescript
const sortedTransactions: TransactionWithOptionalHighlight[] = useMemo(() => {
    // Sort RBR-flagged transactions to the front as primary sort key
    const rbrSortedTransactions = [...transactions].sort((a, b) => {
        const aHasRBR = a.hasRBR ?? false;
        const bHasRBR = b.hasRBR ?? false;
        
        // If RBR status differs, sort by RBR first
        if (aHasRBR !== bHasRBR) {
            return bHasRBR ? 1 : -1;
        }
        
        // Otherwise, use existing sort logic
        return compareValues(getTransactionValue(a, sortBy, report), getTransactionValue(b, sortBy, report), sortOrder, sortBy, localeCompare, true);
    });
    
    return rbrSortedTransactions;
}, [sortBy, sortOrder, transactions, localeCompare, report]);
```

## Testing

1. Open a report with multiple expenses where at least one has RBR indicator
2. Verify RBR expenses appear first in carousel
3. Verify RBR expenses appear first in transaction list
4. Test with various RBR types: violations, holds, field errors, receipt errors

## Files to Modify

1. `src/components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent.tsx`
2. `src/components/MoneyRequestReportView/MoneyRequestReportTransactionList.tsx`

## Notes

- The `hasRBR` property should already be computed for each transaction from the parent component
- If not available, we need to compute it using `shouldShowRBR` from TransactionPreviewUtils
- Alternative approach: compute RBR status inline using violations data from Onyx
