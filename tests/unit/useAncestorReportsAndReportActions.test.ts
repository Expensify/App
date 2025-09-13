import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import useAncestorReportsAndReportActions from '@src/hooks/useAncestorReportsAndReportActions';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const numberOfMockReports = 13;
const mockReports: OnyxCollection<Report> = {};
const mockReportActions: OnyxCollection<ReportActions> = {};

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

describe('useAncestorReportsAndReportActions', () => {
    beforeAll(() => {
        Onyx.multiSet({
            [ONYXKEYS.COLLECTION.REPORT]: mockReports,
            [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: mockReportActions,
        });
        return waitForBatchedUpdates();
    });

    test('returns correct ancestor reports and actions', () => {
        let reportNum = 8;

        const mockReport = mockReports[`${ONYXKEYS.COLLECTION.REPORT}${reportNum}`];
        const {result} = renderHook(() => useAncestorReportsAndReportActions(`${reportNum}`, true));
        const {report, ancestorReportsAndReportActions} = result.current;

        expect(report).toEqual(mockReport);
        expect(ancestorReportsAndReportActions).toHaveLength(7);

        // Check the oldest ancestor (should be reportID 1)
        const {report: oldestAncestorReport, reportAction: oldestAncestorReportAction} = ancestorReportsAndReportActions.at(0) ?? {};
        expect(oldestAncestorReport).toEqual(mockReports[`${ONYXKEYS.COLLECTION.REPORT}1`]);
        expect(oldestAncestorReportAction).toEqual(mockReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]?.['1']);

        reportNum -= 1; // 8->7

        // Check the youngest ancestor (should be reportID 7)
        const {report: youngestAncestorReport, reportAction: youngestAncestorReportAction} = ancestorReportsAndReportActions.at(-1) ?? {};
        expect(youngestAncestorReport).toEqual(mockReports[`${ONYXKEYS.COLLECTION.REPORT}${reportNum}`]);
        expect(youngestAncestorReportAction).toEqual(mockReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportNum}`]?.[`${reportNum}`]);

        // Check the rest of the ancestors
        while (reportNum > 2) {
            reportNum -= 1;
            const {report: ancestorReport, reportAction: ancestorReportAction} = ancestorReportsAndReportActions.at(reportNum - 1) ?? {};
            expect(ancestorReport).toEqual(mockReports[`${ONYXKEYS.COLLECTION.REPORT}${reportNum}`]);
            expect(ancestorReportAction).toEqual(mockReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportNum}`]?.[`${reportNum}`]);
        }
    });

    test('if no ancestor reports', () => {
        const mockReport = Object.values(mockReports).at(0); // First report, should have no ancestors

        const {result} = renderHook(() => useAncestorReportsAndReportActions('1', true));

        expect(result.current.ancestorReportsAndReportActions).toHaveLength(0);
        expect(result.current.report).toEqual(mockReport);
    });

    test('if reportID is non-existent', () => {
        const {result} = renderHook(() => useAncestorReportsAndReportActions('non-existent-report-id', true));

        expect(result.current.ancestorReportsAndReportActions).toHaveLength(0);
        expect(result.current.report).toBeUndefined();
    });

    test('if reportID is an empty string', () => {
        const {result} = renderHook(() => useAncestorReportsAndReportActions('', true));

        expect(result.current.ancestorReportsAndReportActions).toHaveLength(0);
        expect(result.current.report).toBeUndefined();
    });
});
