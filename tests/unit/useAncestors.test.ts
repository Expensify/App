import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useAncestors from '@hooks/useAncestors';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const numberOfMockReports = 11;

const mockReports: Record<string, Report> = {};
const mockReportActions: Record<string, ReportActions> = {};

let parentReportID: string | undefined;
let parentReportActionID: string | undefined;

for (let reportNum = 1; reportNum <= numberOfMockReports; reportNum++) {
    const reportID = `${reportNum}`;

    const report: Report = {
        reportID,
        parentReportID,
        parentReportActionID,
    };

    const reportAction: ReportAction = {
        reportID,
        parentReportID,
        reportActionID: `${reportNum}`,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created: DateUtils.getDBTime(),
    };

    const reportActions: ReportActions = {
        [reportAction.reportActionID]: reportAction,
    };

    mockReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = report;
    mockReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = reportActions;

    parentReportID = reportID;
    parentReportActionID = reportAction.reportActionID;
}

describe('useAncestors', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        Onyx.multiSet({
            [ONYXKEYS.COLLECTION.REPORT]: mockReports,
            [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: mockReportActions,
        });
        return waitForBatchedUpdates();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    test('returns correct ancestor reports and actions', () => {
        let reportNum = 8;

        const mockReport = mockReports[`${ONYXKEYS.COLLECTION.REPORT}${reportNum}`];
        const {
            result: {current: ancestors},
        } = renderHook(() => useAncestors(mockReport));

        // Check the oldest ancestor (should be reportID 1)
        const {report: oldestAncestorReport, reportAction: oldestAncestorReportAction} = ancestors.at(0) ?? {};
        expect(oldestAncestorReport).toEqual(mockReports[`${ONYXKEYS.COLLECTION.REPORT}1`]);
        expect(oldestAncestorReportAction).toEqual(mockReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]?.['1']);

        reportNum -= 1; // 8->7

        // Check the youngest ancestor (should be reportID 7)
        const {report: youngestAncestorReport, reportAction: youngestAncestorReportAction} = ancestors.at(-1) ?? {};
        expect(youngestAncestorReport).toEqual(mockReports[`${ONYXKEYS.COLLECTION.REPORT}${reportNum}`]);
        expect(youngestAncestorReportAction).toEqual(mockReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportNum}`]?.[`${reportNum}`]);

        // Check the rest of the ancestors
        while (reportNum > 2) {
            reportNum -= 1;
            const {report: ancestorReport, reportAction: ancestorReportAction} = ancestors.at(reportNum - 1) ?? {};
            expect(ancestorReport).toEqual(mockReports[`${ONYXKEYS.COLLECTION.REPORT}${reportNum}`]);
            expect(ancestorReportAction).toEqual(mockReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportNum}`]?.[`${reportNum}`]);
        }
    });

    test('if no ancestor reports', () => {
        const mockReport = mockReports[`${ONYXKEYS.COLLECTION.REPORT}1`]; // First report, should have no ancestors
        const {
            result: {current: ancestors},
        } = renderHook(() => useAncestors(mockReport));
        expect(ancestors).toHaveLength(0);
    });

    test('if report is empty', () => {
        const emptyReport: Report = {reportID: ''};
        const {
            result: {current: ancestors},
        } = renderHook(() => useAncestors(emptyReport));

        expect(ancestors).toHaveLength(0);
    });

    test('if report is non-existent', () => {
        const nonExistentReport: Report = {
            reportID: 'non-existent',
        };
        const {
            result: {current: ancestors},
        } = renderHook(() => useAncestors(nonExistentReport));

        expect(ancestors).toHaveLength(0);
    });

    test('if report is undefined', () => {
        const {
            result: {current: ancestors},
        } = renderHook(() => useAncestors(undefined));

        expect(ancestors).toHaveLength(0);
    });
});
