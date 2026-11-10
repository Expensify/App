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

    test('does not re-render when a report or action outside the ancestor chain changes', async () => {
        // Given report 3, whose ancestors are reports 1 and 2, and the rest of the mocked chain
        await act(async () => {
            await Onyx.multiSet(createMock<OnyxMultiSetInput>({...mockReports, ...mockReportActions}));
        });
        let renderCount = 0;
        const {result} = renderHook(() => {
            renderCount++;
            return useAncestors(mockReports[`${ONYXKEYS.COLLECTION.REPORT}3`]);
        });
        await waitForBatchedUpdates();
        const renderCountBefore = renderCount;

        // When report 5, which is below report 3 and not its ancestor, gets a read time and a new action
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}5`, {lastReadTime: DateUtils.getDBTime()});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}5`, {
                new: {reportActionID: 'new', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: DateUtils.getDBTime()},
            });
        });

        // Then the selectors keep the chain unchanged, so the caller does not re-render
        expect(renderCount).toBe(renderCountBefore);

        // When an ancestor report changes
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportName: 'Renamed'});
        });

        // Then the caller re-renders with the new ancestor
        expect(renderCount).toBeGreaterThan(renderCountBefore);
        expect(result.current.at(0)?.report.reportName).toBe('Renamed');
    });

    test('follows the chain through a parent that only exists as a report draft', async () => {
        // Given a report whose parent is a draft, and the draft's parent is a saved report
        const rootAction: ReportAction = {reportActionID: 'rootAction', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: DateUtils.getDBTime()};
        const draftAction: ReportAction = {reportActionID: 'draftAction', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: DateUtils.getDBTime()};
        const rootReport: Report = {reportID: 'root'};
        const draftReport: Report = {reportID: 'draft', parentReportID: 'root', parentReportActionID: 'rootAction'};
        const childReport: Report = {reportID: 'child', parentReportID: 'draft', parentReportActionID: 'draftAction'};
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}root`, rootReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}draft`, draftReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}root`, {rootAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}draft`, {draftAction});
        });

        // When the ancestors of the child report are read
        const {result} = renderHook(() => useAncestors(childReport));
        await waitForBatchedUpdates();

        // Then both the draft parent and the saved root are returned, top-most first
        expect(result.current.map(({report, reportAction}) => [report.reportID, reportAction.reportActionID])).toEqual([
            ['root', 'rootAction'],
            ['draft', 'draftAction'],
        ]);
    });

    test('stops at a malformed parent cycle without listing the report as its own ancestor', async () => {
        // Given a report and its parent that point at each other, as corrupt data could
        const childReport: Report = {reportID: 'cycleChild', parentReportID: 'cycleParent', parentReportActionID: 'parentAction'};
        const parentReport: Report = {reportID: 'cycleParent', parentReportID: 'cycleChild', parentReportActionID: 'childAction'};
        const parentAction: ReportAction = {reportActionID: 'parentAction', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: DateUtils.getDBTime()};
        const childAction: ReportAction = {reportActionID: 'childAction', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: DateUtils.getDBTime()};
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}cycleChild`, childReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}cycleParent`, parentReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}cycleParent`, {parentAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}cycleChild`, {childAction});
        });

        // When the ancestors of the child report are read
        const {result} = renderHook(() => useAncestors(childReport));
        await waitForBatchedUpdates();

        // Then only the parent is returned, so the walk ends instead of looping back to the child
        expect(result.current.map(({report}) => report.reportID)).toEqual(['cycleParent']);
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
