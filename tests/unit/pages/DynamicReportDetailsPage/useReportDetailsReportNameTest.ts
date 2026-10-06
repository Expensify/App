import {act, renderHook} from '@testing-library/react-native';

import useReportDetailsReportName from '@pages/DynamicReportDetailsPage/useReportDetailsReportName';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportAttributesDerivedValue} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const PARENT_REPORT_ID = '2';

function buildReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        reportName: 'Stored name',
        ...overrides,
    };
}

function buildParentReportAction(actionName: ReportAction['actionName']): ReportAction {
    return {
        reportActionID: '3',
        actionName,
        created: '2026-01-01 00:00:00.000',
    } as ReportAction;
}

async function setDerivedReportNames(namesByReportID: Record<string, string>) {
    const reports: ReportAttributesDerivedValue['reports'] = {};
    for (const [reportID, reportName] of Object.entries(namesByReportID)) {
        reports[reportID] = {reportName, isEmpty: false, brickRoadStatus: undefined, requiresAttention: false, reportErrors: {}};
    }
    await Onyx.set(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {reports, locale: 'en'});
    await waitForBatchedUpdates();
}

describe('useReportDetailsReportName', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should return the derived names of the report and its parent', async () => {
        // Given derived names exist for both the report and its parent
        await setDerivedReportNames({[REPORT_ID]: 'Derived name', [PARENT_REPORT_ID]: 'Derived parent name'});
        const report = buildReport({parentReportID: PARENT_REPORT_ID});
        const parentReport = buildReport({reportID: PARENT_REPORT_ID});

        // When the hook resolves the names
        const {result} = renderHook(() => useReportDetailsReportName(report, parentReport, undefined));

        // Then the derived names win over the stored report name
        expect(result.current.reportName).toBe('Derived name');
        expect(result.current.derivedParentReportName).toBe('Derived parent name');
    });

    it('should fall back to the stored report name when no derived name exists', async () => {
        // Given the derived value has no entry for the report
        await setDerivedReportNames({});
        const report = buildReport();

        // When the hook resolves the names
        const {result} = renderHook(() => useReportDetailsReportName(report, undefined, undefined));

        // Then the page still shows the name stored on the report, and there is no parent name to show
        expect(result.current.reportName).toBe('Stored name');
        expect(result.current.derivedParentReportName).toBeUndefined();
    });

    it('should return an empty name when the report is not loaded', async () => {
        // Given a derived name exists but the report itself is not loaded yet
        await setDerivedReportNames({[REPORT_ID]: 'Derived name'});

        // When the hook resolves the names without a report
        const {result} = renderHook(() => useReportDetailsReportName(undefined, undefined, undefined));

        // Then no name is shown instead of a stale or unrelated one
        expect(result.current.reportName).toBe('');
    });

    it('should use the parent invoice name for a chat thread under an invoice', async () => {
        // Given a chat thread whose parent is an invoice report
        await setDerivedReportNames({[REPORT_ID]: 'Thread name', [PARENT_REPORT_ID]: 'Invoice name'});
        const report = buildReport({parentReportID: PARENT_REPORT_ID, parentReportActionID: '3'});
        const parentReport = buildReport({reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.INVOICE});

        // When the hook resolves the names
        const {result} = renderHook(() => useReportDetailsReportName(report, parentReport, undefined));

        // Then the header shows the invoice name, because getReportForHeader swaps in the parent for invoice threads
        expect(result.current.reportName).toBe('Invoice name');
    });

    it('should strip HTML from the name when the parent action is not a comment', async () => {
        // Given an HTML name on a report whose parent action is not a comment
        await setDerivedReportNames({[REPORT_ID]: '<strong>Bold</strong> name'});
        const report = buildReport();

        // When the hook resolves the names
        const {result} = renderHook(() => useReportDetailsReportName(report, undefined, buildParentReportAction(CONST.REPORT.ACTIONS.TYPE.IOU)));

        // Then the name is converted to plain text
        expect(result.current.reportName).toBe('Bold name');
    });

    it('should keep the raw name when the parent action is a comment', async () => {
        // Given an HTML name on a thread started from a comment
        await setDerivedReportNames({[REPORT_ID]: '<strong>Bold</strong> name'});
        const report = buildReport();

        // When the hook resolves the names
        const {result} = renderHook(() => useReportDetailsReportName(report, undefined, buildParentReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT)));

        // Then the name is left unparsed
        expect(result.current.reportName).toBe('<strong>Bold</strong> name');
    });

    it('should keep the raw name for a group chat', async () => {
        // Given an HTML name on a group chat
        await setDerivedReportNames({[REPORT_ID]: '<strong>Bold</strong> name'});
        const report = buildReport({chatType: CONST.REPORT.CHAT_TYPE.GROUP});

        // When the hook resolves the names
        const {result} = renderHook(() => useReportDetailsReportName(report, undefined, undefined));

        // Then the name is left unparsed
        expect(result.current.reportName).toBe('<strong>Bold</strong> name');
    });

    it('should update the name when the derived name changes', async () => {
        // Given the hook already resolved a derived name
        await setDerivedReportNames({[REPORT_ID]: 'Old name'});
        const report = buildReport();
        const {result} = renderHook(() => useReportDetailsReportName(report, undefined, undefined));
        expect(result.current.reportName).toBe('Old name');

        // When the derived value recomputes with a new name
        await act(async () => {
            await setDerivedReportNames({[REPORT_ID]: 'New name'});
        });

        // Then the hook returns the new name, because it owns the REPORT_ATTRIBUTES subscription
        expect(result.current.reportName).toBe('New name');
    });
});
