import {renderHook} from '@testing-library/react-native';

import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn(
    (
        key: string,
        options?: {
            selector?: (value: unknown) => unknown;
        },
    ) => {
        const value = onyxData[key];
        const selectedValue = options?.selector ? options.selector(value as never) : value;
        return [selectedValue];
    },
);

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => mockUseOnyx(key, options),
}));

describe('useSearchShouldCalculateTotals', () => {
    beforeEach(() => {
        onyxData[ONYXKEYS.SAVED_SEARCHES] = undefined;
        mockUseOnyx.mockClear();
    });

    it('returns false when disabled', () => {
        const {result} = renderHook(() => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.SUBMIT, 123, false));

        expect(result.current).toBe(false);
    });

    it('returns true for eligible suggested searches', () => {
        const {result} = renderHook(() => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.SUBMIT, 123, true));

        expect(result.current).toBe(true);
    });

    it('returns false for non-eligible searches', () => {
        const {result} = renderHook(() => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 123, true));

        expect(result.current).toBe(false);
    });

    it('returns true for saved searches that match the hash', () => {
        onyxData[ONYXKEYS.SAVED_SEARCHES] = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            456: {
                name: 'My search',
                query: 'type:expense',
            },
        };

        const {result} = renderHook(() => useSearchShouldCalculateTotals(undefined, 456, true));

        expect(result.current).toBe(true);
    });

    it('returns false when saved searches do not match the hash', () => {
        onyxData[ONYXKEYS.SAVED_SEARCHES] = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            456: {
                name: 'My search',
                query: 'type:expense',
            },
        };

        const {result} = renderHook(() => useSearchShouldCalculateTotals(undefined, 789, true));

        expect(result.current).toBe(false);
    });

    it('returns true for an ad-hoc search when all matching items are selected', () => {
        const {result} = renderHook(() => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 123, true, true));

        expect(result.current).toBe(true);
    });

    it('returns true when all matching items are selected even when the hook is disabled (select-all bypasses the offset gate)', () => {
        const {result} = renderHook(() => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 123, false, true));

        expect(result.current).toBe(true);
    });

    describe('shouldKeepTotalsUntilQueryChanges', () => {
        it('stays true after all matching items are deselected, so the search is not re-run with totals off', () => {
            const {result, rerender} = renderHook(
                ({areAllMatchingItemsSelected}) => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 123, true, areAllMatchingItemsSelected, true),
                {
                    initialProps: {areAllMatchingItemsSelected: true},
                },
            );

            expect(result.current).toBe(true);

            rerender({areAllMatchingItemsSelected: false});

            expect(result.current).toBe(true);
        });

        it('does not latch when the caller has not opted in, so the footer gate still follows the selection', () => {
            const {result, rerender} = renderHook(
                ({areAllMatchingItemsSelected}) => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 123, true, areAllMatchingItemsSelected),
                {
                    initialProps: {areAllMatchingItemsSelected: true},
                },
            );

            expect(result.current).toBe(true);

            rerender({areAllMatchingItemsSelected: false});

            expect(result.current).toBe(false);
        });

        it('drops the latch when the query changes, so a new ad-hoc search does not inherit it', () => {
            const {result, rerender} = renderHook(({searchHash}) => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, searchHash, true, searchHash === 123, true), {
                initialProps: {searchHash: 123},
            });

            expect(result.current).toBe(true);

            rerender({searchHash: 456});

            expect(result.current).toBe(false);
        });

        it('does not keep totals on for paginated loads of an eligible search, so the latch cannot defeat the offset gate', () => {
            const {result, rerender} = renderHook(({enabled}) => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.SUBMIT, 123, enabled, false, true), {
                initialProps: {enabled: true},
            });

            expect(result.current).toBe(true);

            // `enabled` is `offset === 0`, so this is the user loading a second page.
            rerender({enabled: false});

            expect(result.current).toBe(false);
        });

        it('does not latch a query that never asked for totals', () => {
            const {result} = renderHook(() => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 123, true, false, true));

            expect(result.current).toBe(false);
        });
    });
});
