# Manual Test Steps: Reset sortBy for time-based view switches

## Issue

When switching from table view to a chart view (line/bar/pie) with a time-based groupBy (month/week/year/quarter), if the user has manually changed `sortBy` to something other than the default (e.g., `groupTotal` instead of `groupMonth`), the `sortBy` should be reset along with `sortOrder` so that the chart displays chronologically.

Currently, only `sortOrder` is reset, but `sortBy` is preserved. This causes the chart to display points ordered by the custom sort column (e.g., by amount) instead of chronologically.

## Expected Behavior

When switching from table to chart view with a time-based groupBy:
- Both `sortBy` AND `sortOrder` should be reset
- The parser should derive the correct defaults: `sortBy:groupMonth sortOrder:asc`
- The chart should display data points in chronological order (left to right)

## Current Behavior (Bug)

- Only `sortOrder` is reset to `asc`
- `sortBy` is preserved (e.g., remains `groupTotal`)
- The chart displays data points ordered by the preserved sort column (e.g., by total spend), not chronologically

## Test Steps

### Scenario: Table with custom sortBy → Chart view

1. Navigate to the Search page
2. Select "Expenses"
3. Open filters and set **Group by** to "Month"
4. Verify the URL shows `sortBy:groupmonth sortOrder:desc` (table default)
5. Click on the "Total" column header in the table to sort by total spend
6. Verify the URL now shows `sortBy:groupTotal sortOrder:desc`
7. Switch the view to "Line" or "Bar"
8. **Expected**: URL should show `sortBy:groupmonth sortOrder:asc` (chronological)
9. **Actual (Bug)**: URL shows `sortBy:groupTotal sortOrder:asc` (sorted by amount, not chronological)
10. Verify the chart displays months chronologically from left to right (earliest to latest)

### Video reproduction

See the video in the [PR review comment](https://github.com/Expensify/App/pull/84424#discussion_r2954951818) for a visual demonstration of this bug.

## Related Files

- `src/libs/SearchQueryUtils.ts` - `buildFilterQueryWithSortDefaults` and `shouldResetSortForViewChange` functions
- `tests/unit/Search/SearchQueryUtilsTest.ts` - Unit tests for these functions
