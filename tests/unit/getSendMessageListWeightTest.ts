import {getSortedReportActionsForDisplay, isReportPreviewAction} from '@libs/ReportActionsUtils';
import getSendMessageListWeight from '@libs/telemetry/getSendMessageListWeight';

import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';

const REPORT_ID = '1';

function makeAction(action: Partial<ReportAction> & Pick<ReportAction, 'reportActionID' | 'actionName'>): ReportAction {
    return {
        reportID: REPORT_ID,
        created: '2024-01-01 00:00:00.000',
        message: [{html: 'hello', type: 'COMMENT', text: 'hello'}],
        originalMessage: {html: 'hello', whisperedTo: []},
        ...action,
    } as ReportAction;
}

function toCollection(actions: ReportAction[]): ReportActions {
    return Object.fromEntries(actions.map((action) => [action.reportActionID, action])) as ReportActions;
}

describe('getSendMessageListWeight', () => {
    it('counts visible actions and the report previews among them', () => {
        const actions = toCollection([
            makeAction({reportActionID: '1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: '2024-01-01 00:00:00.000'}),
            makeAction({reportActionID: '2', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '2024-01-01 00:00:01.000'}),
            makeAction({reportActionID: '3', actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, created: '2024-01-01 00:00:02.000'}),
            makeAction({reportActionID: '4', actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, created: '2024-01-01 00:00:03.000'}),
        ]);

        const result = getSendMessageListWeight(actions, REPORT_ID, true);

        expect(result.reportActionCount).toBe(4);
        expect(result.moneyRequestPreviewCount).toBe(2);
    });

    it('excludes a hidden report preview (shouldShow === false, no pending action) from both counts', () => {
        const actions = toCollection([
            makeAction({reportActionID: '1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: '2024-01-01 00:00:00.000'}),
            makeAction({reportActionID: '2', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '2024-01-01 00:00:01.000'}),
            makeAction({reportActionID: '3', actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, created: '2024-01-01 00:00:02.000'}),
            // Hidden preview: rendered nowhere, so it must not inflate the counts.
            makeAction({reportActionID: '4', actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, created: '2024-01-01 00:00:03.000', shouldShow: false, pendingAction: undefined}),
        ]);

        const result = getSendMessageListWeight(actions, REPORT_ID, true);

        expect(result.reportActionCount).toBe(3);
        expect(result.moneyRequestPreviewCount).toBe(1);
    });

    it('falls back to the passed reportID for actions whose own reportID is undefined, so they are not dropped', () => {
        const actions = toCollection([
            makeAction({reportActionID: '1', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: '2024-01-01 00:00:00.000', reportID: undefined}),
            makeAction({reportActionID: '2', actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, created: '2024-01-01 00:00:01.000', reportID: undefined}),
        ]);

        // Without the reportID fallback these actions have no reportID and getSortedReportActionsForDisplay drops them.
        expect(getSendMessageListWeight(actions, undefined, true).reportActionCount).toBe(0);
        expect(getSendMessageListWeight(actions, REPORT_ID, true).reportActionCount).toBe(2);
        expect(getSendMessageListWeight(actions, REPORT_ID, true).moneyRequestPreviewCount).toBe(1);
    });

    it.each([CONST.REPORT.ACTIONS.TYPE.SUBMITTED, CONST.REPORT.ACTIONS.TYPE.FORWARDED])('includes the synthetic routed action for %s', (actionName) => {
        // Given a workflow action that produces an additional display row
        const actions = toCollection([
            makeAction({
                reportActionID: 'workflow',
                actionName,
                originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'approver@example.com'},
            }),
            makeAction({reportActionID: 'preview', actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW}),
        ]);

        // When telemetry counts actions without sorting
        const result = getSendMessageListWeight(actions, REPORT_ID, true);
        const displayedActions = getSortedReportActionsForDisplay(actions, true, false, undefined, REPORT_ID);

        // Then counts include synthetic rows and match the display pipeline
        expect(result).toEqual({reportActionCount: 3, moneyRequestPreviewCount: 1});
        expect(result.reportActionCount).toBe(displayedActions.length);
        expect(result.moneyRequestPreviewCount).toBe(displayedActions.filter(isReportPreviewAction).length);
    });

    it('returns zero counts for an empty action list', () => {
        const result = getSendMessageListWeight({}, REPORT_ID, true);

        expect(result.reportActionCount).toBe(0);
        expect(result.moneyRequestPreviewCount).toBe(0);
    });
});
