import {act, renderHook} from '@testing-library/react-native';

import useAncestors from '@hooks/useAncestors';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const numberOfMockReports = 11;

const mockReports: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report> = {};
const mockReportActions: Record<`${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`, ReportActions> = {};

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

        Onyx.multiSet(
            createMock<OnyxMultiSetInput>({
                ...mockReports,
                ...mockReportActions,
            }),
        );
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

    test('re-renders only when a report or action on the parent chain changes', async () => {
        // Given a report whose parents are reports 1 and 2
        await act(async () => {
            await Onyx.multiSet(createMock<OnyxMultiSetInput>({...mockReports, ...mockReportActions}));
        });
        const report = mockReports[`${ONYXKEYS.COLLECTION.REPORT}3`];
        let renderCount = 0;
        const {result} = renderHook(() => {
            renderCount++;
            return useAncestors(report);
        });
        await waitForBatchedUpdates();
        const rendersBefore = renderCount;

        // When a report and an action outside the chain change
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}10`, {reportName: 'Renamed'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}10`, {
                newAction: {reportActionID: 'newAction', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: DateUtils.getDBTime()},
            });
        });

        // Then the hook doesn't render again, because a message in any chat of the account must not re-render every caller
        expect(renderCount).toBe(rendersBefore);

        // When the parent report changes
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {reportName: 'Parent renamed'});
        });

        // Then the ancestors show it
        expect(result.current.at(-1)?.report.reportName).toBe('Parent renamed');
    });
});
