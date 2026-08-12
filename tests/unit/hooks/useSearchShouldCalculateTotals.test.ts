import {renderHook} from '@testing-library/react-native';

import useSearchShouldCalculateTotals, {getSearchRequestOffsetForMissingAllMatchingCount} from '@hooks/useSearchShouldCalculateTotals';

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

    it('returns false for an all-matching selection when the caller has already obtained totals for pagination', () => {
        const {result} = renderHook(() => useSearchShouldCalculateTotals(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 123, false, true));

        expect(result.current).toBe(false);
    });
});

describe('getSearchRequestOffsetForMissingAllMatchingCount', () => {
    it('uses the server-confirmed offset when the local offset advanced without loading another page', () => {
        expect(getSearchRequestOffsetForMissingAllMatchingCount(50, 0, true)).toBe(0);
    });

    it('keeps the offset when the page was genuinely loaded', () => {
        expect(getSearchRequestOffsetForMissingAllMatchingCount(50, 50, true)).toBe(50);
    });

    it('keeps the pagination offset after the matching count is available', () => {
        expect(getSearchRequestOffsetForMissingAllMatchingCount(100, 50, false)).toBe(100);
    });
});
