import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import useSearchSections, {selectPendingDeleteReportKeys} from '@hooks/useSearchSections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

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

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, email: 'test@test.com'}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatPhoneNumber: (phone: string) => phone,
        translate: (key: string) => key,
    }),
}));

jest.mock('@hooks/useActionLoadingReportIDs', () => ({
    __esModule: true,
    default: () => new Set(),
}));

jest.mock('@hooks/useArchivedReportsIdSet', () => ({
    __esModule: true,
    default: () => new Set(),
}));

// Mock getSections/getSortedSections to return controlled report IDs
const mockGetSortedSections = jest.fn();
jest.mock('@libs/SearchUIUtils', () => ({
    getSections: () => [[], {}],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getSortedSections: (...args: unknown[]) => mockGetSortedSections(...args),
}));

describe('useSearchSections', () => {
    beforeEach(() => {
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockUseOnyx.mockClear();
        mockGetSortedSections.mockReset();
        mockGetSortedSections.mockReturnValue([]);
    });

    describe('selectPendingDeleteReportKeys', () => {
        it('returns empty array for null/undefined collection', () => {
            expect(selectPendingDeleteReportKeys(null as unknown as OnyxCollection<Report>)).toEqual([]);
            expect(selectPendingDeleteReportKeys(undefined as unknown as OnyxCollection<Report>)).toEqual([]);
        });

        it('returns empty array when no reports are pending delete', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1'} as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2'} as Report,
            };
            expect(selectPendingDeleteReportKeys(reports)).toEqual([]);
        });

        it('returns keys of reports with pendingAction DELETE', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2'} as Report,
            };
            expect(selectPendingDeleteReportKeys(reports)).toEqual([`${ONYXKEYS.COLLECTION.REPORT}1`]);
        });

        it('returns keys of reports with pendingFields.preview DELETE', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1'} as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2', pendingFields: {preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}} as Report,
            };
            expect(selectPendingDeleteReportKeys(reports)).toEqual([`${ONYXKEYS.COLLECTION.REPORT}2`]);
        });

        it('returns sorted keys when multiple reports are pending delete', () => {
            const reports: OnyxCollection<Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: {reportID: '3', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1', pendingFields: {preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}} as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2'} as Report,
            };
            const result = selectPendingDeleteReportKeys(reports);
            expect(result).toEqual([`${ONYXKEYS.COLLECTION.REPORT}1`, `${ONYXKEYS.COLLECTION.REPORT}3`]);
        });
    });

    describe('pending delete filtering', () => {
        it('returns empty allReports when no search query exists', () => {
            const {result} = renderHook(() => useSearchSections());

            expect(result.current.allReports).toEqual([]);
        });

        it('filters out pending delete reports from allReports', () => {
            const pendingDeleteKeys = [`${ONYXKEYS.COLLECTION.REPORT}2`];
            const snapshotHash = 12345;

            mockGetSortedSections.mockReturnValue([{reportID: '1'}, {reportID: '2'}, {reportID: '3'}]);

            mockUseOnyx.mockImplementation(
                (
                    key: string,
                    options?: {
                        selector?: (value: unknown) => unknown;
                    },
                ) => {
                    if (key === ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY) {
                        return [{queryJSON: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash: snapshotHash}}];
                    }
                    if (key === `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`) {
                        return [{data: {}, search: {isLoading: false}}];
                    }
                    if (key === ONYXKEYS.COLLECTION.REPORT) {
                        return [pendingDeleteKeys];
                    }
                    const value = onyxData[key];
                    const selectedValue = options?.selector ? options.selector(value as never) : value;
                    return [selectedValue];
                },
            );

            const {result} = renderHook(() => useSearchSections());

            expect(result.current.allReports).toEqual(['1', '3']);
        });

        it('returns all reports when none are pending delete', () => {
            const snapshotHash = 12345;

            mockGetSortedSections.mockReturnValue([{reportID: '1'}, {reportID: '2'}, {reportID: '3'}]);

            mockUseOnyx.mockImplementation(
                (
                    key: string,
                    options?: {
                        selector?: (value: unknown) => unknown;
                    },
                ) => {
                    if (key === ONYXKEYS.REPORT_NAVIGATION_LAST_SEARCH_QUERY) {
                        return [{queryJSON: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT, hash: snapshotHash}}];
                    }
                    if (key === `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`) {
                        return [{data: {}, search: {isLoading: false}}];
                    }
                    if (key === ONYXKEYS.COLLECTION.REPORT) {
                        return [[]];
                    }
                    const value = onyxData[key];
                    const selectedValue = options?.selector ? options.selector(value as never) : value;
                    return [selectedValue];
                },
            );

            const {result} = renderHook(() => useSearchSections());

            expect(result.current.allReports).toEqual(['1', '2', '3']);
        });
    });
});
