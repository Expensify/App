/**
 * Test: Default sort order for Search results
 *
 * Bug #91935: "Spend - Default sort is descending"
 * Expected: Default sort should be ASC (oldest first)
 * Actual:   Default sort is DESC (newest first)
 *
 * This test reads the actual source code of SearchResultsProvider.tsx and
 * verifies that the defaultSearchInfo.sortOrder is set to ASC, matching
 * what MoneyRequestReportTransactionList expects.
 */
import {readFileSync} from 'fs';
import {join} from 'path';

describe('SearchResultsProvider default sort (Bug #91935)', () => {
    const providerPath = join(__dirname, '../../src/components/Search/SearchResultsProvider.tsx');
    const providerSource = readFileSync(providerPath, 'utf-8');

    it('defaultSearchInfo.sortOrder should be ASC', () => {
        // Extract the sortOrder line from the defaultSearchInfo object
        const match = providerSource.match(/sortOrder:\s*CONST\.SEARCH\.SORT_ORDER\.(\w+)/);
        expect(match).not.toBeNull();
        expect(match![1]).toBe('ASC');
    });

    it('defaultSearchInfo.sortBy should be DATE', () => {
        const match = providerSource.match(/sortBy:\s*CONST\.SEARCH\.TABLE_COLUMNS\.(\w+)/);
        expect(match).not.toBeNull();
        expect(match![1]).toBe('DATE');
    });
});
