import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReportAttributes from '@hooks/useReportAttributes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID_1 = 'reportID1';
const REPORT_ID_2 = 'reportID2';
const REPORT_ID_3 = 'reportID3';

function createMockReport(overrides: Partial<ReportAttributes> = {}): ReportAttributes {
    return {
        reportName: 'Default Report',
        isEmpty: false,
        brickRoadStatus: undefined,
        requiresAttention: false,
        reportErrors: {},
        ...overrides,
    };
}

function createDerivedValue(reports: ReportAttributesDerivedValue['reports'], locale = 'en'): ReportAttributesDerivedValue {
    return {reports, locale};
}

const MOCK_REPORTS: ReportAttributesDerivedValue['reports'] = {
    [REPORT_ID_1]: createMockReport({reportName: 'Report 1'}),
    [REPORT_ID_2]: createMockReport({
        reportName: 'Report 2',
        isEmpty: true,
        brickRoadStatus: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
        requiresAttention: true,
        reportErrors: {error: 'Something went wrong'},
    }),
};

describe('useReportAttributes', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should return undefined when the derived value is not set', async () => {
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useReportAttributes());

        expect(result.current).toBeUndefined();
    });

    it('should return the reports from the derived value', async () => {
        await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, createDerivedValue(MOCK_REPORTS));

        await waitForBatchedUpdates();

        const {result} = renderHook(() => useReportAttributes());

        expect(result.current).toEqual(MOCK_REPORTS);
    });

    it('should return reports with correct attributes', async () => {
        await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, createDerivedValue(MOCK_REPORTS));

        await waitForBatchedUpdates();

        const {result} = renderHook(() => useReportAttributes());

        expect(result.current?.[REPORT_ID_1]?.reportName).toBe('Report 1');
        expect(result.current?.[REPORT_ID_1]?.isEmpty).toBe(false);
        expect(result.current?.[REPORT_ID_1]?.brickRoadStatus).toBeUndefined();
        expect(result.current?.[REPORT_ID_2]?.brickRoadStatus).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        expect(result.current?.[REPORT_ID_2]?.requiresAttention).toBe(true);
    });

    it('should return an empty object when reports is empty', async () => {
        await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, createDerivedValue({}));

        await waitForBatchedUpdates();

        const {result} = renderHook(() => useReportAttributes());

        expect(result.current).toEqual({});
    });

    it('should update when the derived value changes', async () => {
        await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, createDerivedValue(MOCK_REPORTS));

        await waitForBatchedUpdates();

        const {result, rerender} = renderHook(() => useReportAttributes());

        expect(Object.keys(result.current ?? {})).toHaveLength(2);

        const updatedReports: ReportAttributesDerivedValue['reports'] = {
            [REPORT_ID_3]: createMockReport({
                reportName: 'Report 3',
                brickRoadStatus: CONST.BRICK_ROAD_INDICATOR_STATUS.INFO,
                requiresAttention: true,
            }),
        };

        await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, createDerivedValue(updatedReports));

        await waitForBatchedUpdates();
        rerender(undefined);

        expect(Object.keys(result.current ?? {})).toHaveLength(1);
        expect(result.current?.[REPORT_ID_3]?.reportName).toBe('Report 3');
    });
});
