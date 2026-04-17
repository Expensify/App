import {renderHook} from '@testing-library/react-native';
import useSearchSections from '@hooks/useSearchSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = onyxData[key];
    const selectedValue = options?.selector ? options.selector(value as never) : value;
    return [selectedValue];
});

jest.mock('@hooks/useOnyx', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: (key: string, options?: {selector?: (value: unknown) => unknown}) => mockUseOnyx(key, options),
}));

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatPhoneNumber: (phone: string) => phone,
        translate: (key: string) => key,
    }),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({accountID: 1, email: 'test@test.com'}),
}));

jest.mock('@hooks/useActionLoadingReportIDs', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => new Set(),
}));

jest.mock('@hooks/useArchivedReportsIdSet', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => new Set(),
}));

const mockGetSortedSections = jest.fn();
const mockGetSections = jest.fn();
jest.mock('@libs/SearchUIUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getSortedSections: (...args: unknown[]) => mockGetSortedSections(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getSections: (...args: unknown[]) => mockGetSections(...args),
}));

describe('useSearchSections', () => {
    beforeEach(() => {
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockUseOnyx.mockClear();
        mockGetSortedSections.mockReset();
        mockGetSortedSections.mockReturnValue([]);
        mockGetSections.mockReset();
        mockGetSections.mockReturnValue([[]]);
    });

    describe('report ID computation', () => {
        it('calls getSortedSections and returns results', () => {
            mockGetSortedSections.mockReturnValue([{reportID: '1'}, {reportID: '2'}]);
            mockGetSections.mockReturnValue([[{reportID: '1'}, {reportID: '2'}]]);
            onyxData[ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY] = {
                queryJSON: {hash: '123', type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, status: CONST.SEARCH.STATUS.EXPENSE.ALL},
            };
            onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}123`] = {
                data: {reports: {}},
                search: {isLoading: false},
            };

            const {result} = renderHook(() => useSearchSections());

            expect(mockGetSortedSections).toHaveBeenCalled();
            expect(result.current.allReports).toEqual(['1', '2']);
        });

        it('filters out pending delete reports from results', () => {
            mockGetSortedSections.mockReturnValue([{reportID: '1'}, {reportID: '2'}, {reportID: '3'}]);
            mockGetSections.mockReturnValue([[{reportID: '1'}, {reportID: '2'}, {reportID: '3'}]]);
            onyxData[ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY] = {
                queryJSON: {hash: '123', type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, status: CONST.SEARCH.STATUS.EXPENSE.ALL},
            };
            onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}123`] = {
                data: {reports: {}},
                search: {isLoading: false},
            };
            onyxData[ONYXKEYS.COLLECTION.REPORT] = {
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as unknown as Report,
            };

            const {result} = renderHook(() => useSearchSections());

            expect(result.current.allReports).toEqual(['1', '3']);
        });

        it('returns empty allReports when search results are not yet loaded', () => {
            onyxData[ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY] = {
                queryJSON: {hash: '123', type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, status: CONST.SEARCH.STATUS.EXPENSE.ALL},
            };
            // No snapshot data — simulates deep-link before search has run

            const {result} = renderHook(() => useSearchSections());

            expect(mockGetSortedSections).not.toHaveBeenCalled();
            expect(result.current.allReports).toEqual([]);
        });
    });
});
