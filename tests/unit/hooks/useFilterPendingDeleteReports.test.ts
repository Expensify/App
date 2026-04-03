import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import useFilterPendingDeleteReports, {selectPendingDeleteReportKeys} from '@hooks/useFilterPendingDeleteReports';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

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

describe('useFilterPendingDeleteReports', () => {
    beforeEach(() => {
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockUseOnyx.mockClear();
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
            expect(selectPendingDeleteReportKeys(reports)).toEqual([`${ONYXKEYS.COLLECTION.REPORT}1`, `${ONYXKEYS.COLLECTION.REPORT}3`]);
        });
    });

    describe('useFilterPendingDeleteReports', () => {
        it('returns all IDs when no reports are pending delete', () => {
            const {result} = renderHook(() => useFilterPendingDeleteReports(['1', '2', '3']));
            expect(result.current).toEqual(['1', '2', '3']);
        });

        it('filters out IDs of reports with pending delete', () => {
            onyxData[ONYXKEYS.COLLECTION.REPORT] = {
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as Report,
            };

            const {result} = renderHook(() => useFilterPendingDeleteReports(['1', '2', '3']));
            expect(result.current).toEqual(['1', '3']);
        });

        it('filters out undefined entries', () => {
            const {result} = renderHook(() => useFilterPendingDeleteReports(['1', undefined, '3']));
            expect(result.current).toEqual(['1', '3']);
        });

        it('returns empty array when all reports are pending delete', () => {
            onyxData[ONYXKEYS.COLLECTION.REPORT] = {
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: {reportID: '1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as Report,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: {reportID: '2', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as Report,
            };

            const {result} = renderHook(() => useFilterPendingDeleteReports(['1', '2']));
            expect(result.current).toEqual([]);
        });

        it('returns empty array for empty input', () => {
            const {result} = renderHook(() => useFilterPendingDeleteReports([]));
            expect(result.current).toEqual([]);
        });
    });
});
