/** Regression coverage for sharing a report sort without retaining unresolved policy URLs. */
import type * as EnvironmentModule from '@libs/Environment/Environment';
import {getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';

let mockResolveEnvironmentURL: (url: string) => void;

jest.mock('@libs/Environment/Environment', () => {
    const environmentURL = new Promise<string>((resolve) => {
        mockResolveEnvironmentURL = resolve;
    });
    return {
        ...jest.requireActual<typeof EnvironmentModule>('@libs/Environment/Environment'),
        getEnvironmentURL: jest.fn(() => environmentURL),
    };
});

const comment: ReportAction = {
    reportActionID: '1',
    reportID: '1',
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2026-01-01 00:00:00.000',
    message: [{html: 'Hello', text: 'Hello', type: 'COMMENT'}],
};

it('retries an unresolved policy URL, preserves stored messages, and shares only immutable unfiltered report sorts', async () => {
    // Given a frozen Onyx value read before the environment lookup finishes.
    const message = Object.freeze({html: '%baseURL/r/1', text: 'Policy updated', type: 'COMMENT'});
    const policyAction: ReportAction = {
        ...comment,
        reportActionID: '2',
        actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME,
        message: Object.freeze([message]),
    };
    const report: ReportActions = Object.freeze({[comment.reportActionID]: comment, [policyAction.reportActionID]: policyAction});
    const pending = getSortedReportActionsForDisplay(report, true, true);
    // When the original asynchronous lookup resolves after the first read.
    expect(getSortedReportActionsForDisplay(report, true, true)).not.toBe(pending);
    mockResolveEnvironmentURL('https://new.expensify.com');
    await Promise.resolve();
    const resolved = getSortedReportActionsForDisplay(report, true, true);

    // Then the resolved result is shared across readers without mutating the stored nested message.
    expect(resolved).toBe(getSortedReportActionsForDisplay(report, false, true));
    expect(resolved.find((action) => action.reportActionID === '2')?.message).toEqual([{...message, html: 'https://new.expensify.com/r/1'}]);
    expect(message.html).toBe('%baseURL/r/1');
    expect(getSortedReportActionsForDisplay({...report}, true, true)).not.toBe(resolved);
    expect(getSortedReportActionsForDisplay(report, true)).not.toBe(getSortedReportActionsForDisplay(report, true));

    // Given an array that a caller changes between reads.
    const mutable = [comment];
    const before = getSortedReportActionsForDisplay(mutable, true, true);

    // When another action is appended to that same array.
    mutable.push(policyAction);

    // Then the new action participates in the next sort.
    expect(before).toHaveLength(1);
    expect(getSortedReportActionsForDisplay(mutable, true, true)).toHaveLength(2);

    // Given a workflow submission and a CREATED action whose timestamp is later than the submission.
    const submitted: ReportAction = {
        ...comment,
        reportActionID: '3',
        actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
    };
    Object.assign(submitted, {originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'approver@example.com'}});
    const created: ReportAction = {...comment, reportActionID: '4', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, created: '2026-01-02 00:00:00.000'};

    // When the immutable report is sorted, including its synthetic routed action.
    const workflowReport: ReportActions = {[submitted.reportActionID]: submitted, [created.reportActionID]: created};
    const workflowActions = getSortedReportActionsForDisplay(workflowReport, true, true);

    // Then the routed action stays ahead of its source and CREATED stays oldest regardless of timestamp.
    expect(workflowActions.map((action) => action.reportActionID)).toEqual(['3DEW', '3', '4']);
    expect(getSortedReportActionsForDisplay(workflowReport, true, true)).toBe(workflowActions);
});
