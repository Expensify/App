import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import {getSortedReportActions, getSystemMessageDisplayState, isCollapsibleSystemMessageAction, isSystemMessageAction, withDEWRoutedActionsArray} from '../../src/libs/ReportActionsUtils';

function makeAction(reportActionID: string, actionName: ReportAction['actionName'], overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        reportActionID,
        actionName,
        actorAccountID: 1,
        created: `2026-07-30 00:00:0${reportActionID}.000`,
        message: [{type: 'TEXT', html: reportActionID, text: reportActionID}],
        ...overrides,
    };
}

const OLD_DOT_SYSTEM_MESSAGE_ACTION_TYPES = [
    CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD,
    CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE,
    CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV,
    CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
    CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT,
    CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT,
    CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED,
    CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION,
    CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED,
    CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT,
    CONST.REPORT.ACTIONS.TYPE.SHARE,
    CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID,
    CONST.REPORT.ACTIONS.TYPE.UNSHARE,
    CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
    CONST.REPORT.ACTIONS.TYPE.DONATION,
    CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
] as const;

const NON_COLLAPSIBLE_OLD_DOT_SYSTEM_MESSAGE_ACTION_TYPES = [
    CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
    CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED,
    CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
] as const;

describe('system message presentation', () => {
    describe('classification', () => {
        it.each([
            CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
            CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
            CONST.REPORT.ACTIONS.TYPE.APPROVED,
            CONST.REPORT.ACTIONS.TYPE.FORWARDED,
            CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
            CONST.REPORT.ACTIONS.TYPE.HOLD,
            CONST.REPORT.ACTIONS.TYPE.REJECTED,
            CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
            CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM,
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME,
            CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
            CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
            CONST.REPORT.ACTIONS.TYPE.MOVED,
            CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION,
            CONST.REPORT.ACTIONS.TYPE.TRAVEL_NUDGE,
            CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE,
            CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS,
            CONST.REPORT.ACTIONS.TYPE.COMMUTER_EXCLUSION,
            CONST.REPORT.ACTIONS.TYPE.ACTION_DELEGATE_SUBMIT,
            CONST.REPORT.ACTIONS.TYPE.CARD_FROZEN,
            CONST.REPORT.ACTIONS.TYPE.CARD_UNFROZEN,
            CONST.REPORT.ACTIONS.TYPE.CARD_DEACTIVATED,
            CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
            CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED,
            CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED,
            CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED,
            CONST.REPORT.ACTIONS.TYPE.CONCIERGE_AUTO_MATCH_VENDOR,
            CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION,
            CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
            CONST.REPORT.ACTIONS.TYPE.RENAMED,
            CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED,
            CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN,
            CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN,
            CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE,
            CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
            CONST.REPORT.ACTIONS.TYPE.REROUTE,
            CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER,
            CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN,
            CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED,
            CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
            CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED,
        ])('classifies the passive audit action %s as a system message', (actionName) => {
            expect(isSystemMessageAction(makeAction('1', actionName))).toBe(true);
        });

        it('classifies payment audit actions without sweeping in interactive money requests', () => {
            const paymentAction = makeAction('1', CONST.REPORT.ACTIONS.TYPE.IOU, {
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                },
            });
            const requestAction = makeAction('2', CONST.REPORT.ACTIONS.TYPE.IOU, {
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    amount: 10000,
                    currency: CONST.CURRENCY.USD,
                },
            });

            expect(isSystemMessageAction(paymentAction)).toBe(true);
            expect(isCollapsibleSystemMessageAction(paymentAction)).toBe(true);
            expect(isSystemMessageAction(requestAction)).toBe(false);
            expect(isCollapsibleSystemMessageAction(requestAction)).toBe(false);
        });

        it.each(OLD_DOT_SYSTEM_MESSAGE_ACTION_TYPES)('classifies the legacy audit action %s as a system message', (actionName) => {
            expect(isSystemMessageAction(makeAction('1', actionName))).toBe(true);
        });

        it.each(NON_COLLAPSIBLE_OLD_DOT_SYSTEM_MESSAGE_ACTION_TYPES)('keeps the legacy error or reimbursement state %s outside collapsed runs', (actionName) => {
            const action = makeAction('1', actionName);

            expect(isSystemMessageAction(action)).toBe(true);
            expect(isCollapsibleSystemMessageAction(action)).toBe(false);
        });

        it.each([
            CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            CONST.REPORT.ACTIONS.TYPE.CREATED,
            CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            CONST.REPORT.ACTIONS.TYPE.IOU,
            CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
            CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED,
            CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL,
            CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT,
            CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER,
            CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER,
            CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER,
            CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        ])('does not classify the chat, structural, task, or actionable row %s as a system message', (actionName) => {
            expect(isSystemMessageAction(makeAction('1', actionName))).toBe(false);
        });

        it('keeps pending and failed system messages visible as standalone rows', () => {
            const pendingAction = makeAction('1', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
            const failedAction = makeAction('2', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, {errors: {field: 'Could not update'}});
            const integrationFailure = makeAction('3', CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED);

            expect(isSystemMessageAction(pendingAction)).toBe(true);
            expect(isSystemMessageAction(failedAction)).toBe(true);
            expect(isSystemMessageAction(integrationFailure)).toBe(true);
            expect(isCollapsibleSystemMessageAction(pendingAction)).toBe(false);
            expect(isCollapsibleSystemMessageAction(failedAction)).toBe(false);
            expect(isCollapsibleSystemMessageAction(integrationFailure)).toBe(false);
        });

        it('keeps reimbursement setup actions but outside collapsed runs', () => {
            const reimbursementQueued = makeAction('1', CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED);

            expect(isSystemMessageAction(reimbursementQueued)).toBe(true);
            expect(isCollapsibleSystemMessageAction(reimbursementQueued)).toBe(false);
        });

        it('requires policy change-log actions to opt in explicitly', () => {
            const handledPolicyAction = makeAction('1', CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME);
            const unhandledDescriptionAction = makeAction('2', CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION);
            const unhandledDisabledFieldsAction = makeAction('3', CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DISABLED_FIELDS);

            expect(isSystemMessageAction(handledPolicyAction)).toBe(true);
            expect(isSystemMessageAction(unhandledDescriptionAction)).toBe(false);
            expect(isSystemMessageAction(unhandledDisabledFieldsAction)).toBe(false);
        });

        it('keeps reasoned system messages but outside collapsed runs', () => {
            const originalMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE>['originalMessage'] = {reasoning: 'The expense was changed automatically.'};
            const reasonedAction = makeAction('1', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, {
                originalMessage,
            });

            expect(isSystemMessageAction(reasonedAction)).toBe(true);
            expect(isCollapsibleSystemMessageAction(reasonedAction)).toBe(false);
        });
    });

    describe('display state', () => {
        const systemAction = (reportActionID: string, overrides: Partial<ReportAction> = {}) => makeAction(reportActionID, CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, overrides);
        const chatAction = (reportActionID: string) => makeAction(reportActionID, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);

        it('keeps an empty action list empty', () => {
            const state = getSystemMessageDisplayState([], new Set());

            expect(state.displayReportActions).toEqual([]);
            expect(state.runsByAnchorReportActionID.size).toBe(0);
            expect(state.reportActionIDToDisplayIndex.size).toBe(0);
        });

        it('keeps a singleton system message expanded', () => {
            const action = systemAction('1');
            const state = getSystemMessageDisplayState([action], new Set());

            expect(state.displayReportActions).toEqual([action]);
            expect(state.runsByAnchorReportActionID.size).toBe(0);
            expect(state.reportActionIDToDisplayIndex.get('1')).toBe(0);
        });

        it.each([CONST.REPORT.ACTIONS.TYPE.SUBMITTED, CONST.REPORT.ACTIONS.TYPE.FORWARDED])(
            'keeps a dynamic external workflow %s action separate from the Concierge routed action',
            (actionName) => {
                const sourceAction = makeAction('1', actionName, {
                    originalMessage: {workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL, to: 'workflow@example.com'},
                });
                const actions = withDEWRoutedActionsArray([sourceAction]);
                const collapsedState = getSystemMessageDisplayState(actions, new Set());
                const expandedState = getSystemMessageDisplayState(actions, new Set(['1DEW']));

                expect(actions.map((action) => action.actionName)).toEqual([actionName, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED]);
                expect(actions.every((action) => isSystemMessageAction(action))).toBe(true);
                expect(actions.every((action) => isCollapsibleSystemMessageAction(action))).toBe(true);
                expect(collapsedState.displayReportActions).toEqual(actions);
                expect(collapsedState.runsByAnchorReportActionID.size).toBe(0);
                expect(expandedState.displayReportActions).toEqual(actions);
            },
        );

        it('collapses maximal runs of two or more system messages to one anchor row', () => {
            const actions = [systemAction('1'), systemAction('2'), systemAction('3')];
            const state = getSystemMessageDisplayState(actions, new Set());

            expect(state.displayReportActions).toEqual([actions.at(0)]);
            expect(state.runsByAnchorReportActionID.get('1')).toEqual({
                reportActionIDs: ['1', '2', '3'],
                earliestReportAction: actions.at(0),
                isExpanded: false,
            });
            expect([...state.reportActionIDToDisplayIndex.entries()]).toEqual([
                ['1', 0],
                ['2', 0],
                ['3', 0],
            ]);
        });

        it('keeps newly routed muted audit actions inside a maximal system-message run', () => {
            const actions = [systemAction('1'), makeAction('2', CONST.REPORT.ACTIONS.TYPE.COMMUTER_EXCLUSION), makeAction('3', CONST.REPORT.ACTIONS.TYPE.ACTION_DELEGATE_SUBMIT)];
            const state = getSystemMessageDisplayState(actions, new Set());

            expect(actions.every((action) => isCollapsibleSystemMessageAction(action))).toBe(true);
            expect(state.displayReportActions).toEqual([actions.at(0)]);
            expect(state.runsByAnchorReportActionID.get('1')?.reportActionIDs).toEqual(['1', '2', '3']);
        });

        it('uses chat and non-collapsible error rows as run boundaries', () => {
            const first = systemAction('1');
            const second = systemAction('2');
            const chat = chatAction('3');
            const failed = systemAction('4', {error: 'Could not update'});
            const fifth = systemAction('5');
            const sixth = systemAction('6');
            const state = getSystemMessageDisplayState([first, second, chat, failed, fifth, sixth], new Set());

            expect(state.displayReportActions.map((action) => action.reportActionID)).toEqual(['1', '3', '4', '5']);
            expect([...state.runsByAnchorReportActionID.keys()]).toEqual(['1', '5']);
            expect(state.reportActionIDToDisplayIndex.get('2')).toBe(0);
            expect(state.reportActionIDToDisplayIndex.get('6')).toBe(3);
        });

        it('uses reasoned system messages as run boundaries so their Explain control stays visible', () => {
            const first = systemAction('1');
            const second = systemAction('2');
            const originalMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE>['originalMessage'] = {reasoning: 'The expense was changed automatically.'};
            const reasoned = systemAction('3', {
                originalMessage,
            });
            const fourth = systemAction('4');
            const fifth = systemAction('5');
            const state = getSystemMessageDisplayState([first, second, reasoned, fourth, fifth], new Set());

            expect(state.displayReportActions.map((action) => action.reportActionID)).toEqual(['1', '3', '4']);
            expect([...state.runsByAnchorReportActionID.keys()]).toEqual(['1', '4']);
        });

        it('uses threaded system messages as run boundaries so their reply preview stays visible', () => {
            const first = systemAction('1');
            const second = systemAction('2');
            const threaded = systemAction('3', {
                childReportID: 'thread-report',
                childVisibleActionCount: 1,
                childCommenterCount: 1,
            });
            const fourth = systemAction('4');
            const fifth = systemAction('5');
            const state = getSystemMessageDisplayState([first, second, threaded, fourth, fifth], new Set());

            expect(isCollapsibleSystemMessageAction(threaded)).toBe(false);
            expect(state.displayReportActions.map((action) => action.reportActionID)).toEqual(['1', '3', '4']);
            expect([...state.runsByAnchorReportActionID.keys()]).toEqual(['1', '4']);
        });

        it('restores every member in chronological order when a run is expanded', () => {
            const actions = [systemAction('1'), systemAction('2'), systemAction('3')];
            const state = getSystemMessageDisplayState(actions, new Set(['2']));

            expect(state.displayReportActions).toEqual(actions);
            expect(state.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(true);
            expect([...state.reportActionIDToDisplayIndex.entries()]).toEqual([
                ['1', 0],
                ['2', 1],
                ['3', 2],
            ]);
        });

        it('force-expands a run containing a linked target', () => {
            const actions = [systemAction('1'), systemAction('2'), systemAction('3')];
            const state = getSystemMessageDisplayState(actions, new Set(), ['2']);

            expect(state.displayReportActions).toEqual(actions);
            expect(state.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(true);
            expect(state.reportActionIDToDisplayIndex.get('2')).toBe(1);
        });

        it.each([false, true])('uses the same bounded 24-hour runs in either list direction (newest first: %s)', (newestFirst) => {
            const actions = [
                systemAction('1', {created: '2026-07-30 00:00:00.000'}),
                systemAction('2', {created: '2026-07-30 20:00:00.000'}),
                systemAction('3', {created: '2026-07-31 16:00:00.000'}),
                systemAction('4', {created: '2026-07-31 17:00:00.000'}),
            ];
            const state = getSystemMessageDisplayState(newestFirst ? actions.toReversed() : actions, new Set());
            expect(state.displayReportActions.map((action) => action.reportActionID)).toEqual(newestFirst ? ['4', '2'] : ['1', '3']);
            expect([...state.runsByAnchorReportActionID.values()].map((run) => run.reportActionIDs)).toEqual([
                ['1', '2'],
                ['3', '4'],
            ]);
            expect(state.runsByAnchorReportActionID.get(newestFirst ? '2' : '1')?.earliestReportAction).toBe(actions.at(0));
            expect(state.reportActionIDToDisplayIndex.get('1')).toBe(newestFirst ? 1 : 0);
        });

        it.each([false, true])('collapses updates when CREATED has a later timestamp (newest first: %s)', (newestFirst) => {
            const createdAction = makeAction('1', CONST.REPORT.ACTIONS.TYPE.CREATED, {created: '2026-07-30 10:02:00.000'});
            const firstUpdate = systemAction('2', {created: '2026-07-30 10:00:00.000'});
            const secondUpdate = systemAction('3', {created: '2026-07-30 10:01:00.000'});
            const actions = getSortedReportActions([firstUpdate, createdAction, secondUpdate], newestFirst);
            const anchorID = newestFirst ? '3' : '2';
            const state = getSystemMessageDisplayState(actions, new Set());

            expect(state.displayReportActions).toEqual(newestFirst ? [secondUpdate, createdAction] : [createdAction, firstUpdate]);
            expect(state.runsByAnchorReportActionID.size).toBe(1);
            expect(state.runsByAnchorReportActionID.get(anchorID)).toEqual({
                reportActionIDs: ['2', '3'],
                earliestReportAction: firstUpdate,
                isExpanded: false,
            });
            expect(state.reportActionIDToDisplayIndex.get('1')).toBe(newestFirst ? 1 : 0);
            expect(state.reportActionIDToDisplayIndex.get('2')).toBe(newestFirst ? 0 : 1);
            expect(state.reportActionIDToDisplayIndex.get('3')).toBe(newestFirst ? 0 : 1);

            const expandedState = getSystemMessageDisplayState(actions, new Set([anchorID]));

            expect(expandedState.displayReportActions).toEqual(actions);
            expect(expandedState.runsByAnchorReportActionID.get(anchorID)?.isExpanded).toBe(true);
            for (const [index, action] of actions.entries()) {
                expect(expandedState.reportActionIDToDisplayIndex.get(action.reportActionID)).toBe(index);
            }
        });

        it.each([
            ['2026-07-31 00:00:00.000', 1],
            ['2026-07-31 00:00:00.001', 2],
            ['invalid', 2],
        ])('includes exactly 24 hours but rejects larger or invalid timestamps: %s', (created, expectedRows) => {
            const actions = [systemAction('1', {created: '2026-07-30 00:00:00.000'}), systemAction('2', {created})];
            expect(getSystemMessageDisplayState(actions, new Set()).displayReportActions).toHaveLength(expectedRows);
        });

        const legacyDelegateMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE>['originalMessage'] & {delegateAccountID: number} = {delegateAccountID: 2};
        it.each([{actorAccountID: 2}, {delegateAccountID: 2}, {originalMessage: legacyDelegateMessage}])('keeps different actor/delegate identities in separate runs: %s', (overrides) => {
            const actions = [systemAction('1'), systemAction('2', overrides), systemAction('3', overrides)];
            const state = getSystemMessageDisplayState(actions, new Set());
            expect(state.displayReportActions.map((action) => action.reportActionID)).toEqual(['1', '2']);
            expect(state.runsByAnchorReportActionID.get('2')?.reportActionIDs).toEqual(['2', '3']);
        });

        it('groups actions attributed to the same admin even when the raw submission actor differs', () => {
            const actions = [makeAction('1', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {adminAccountID: 2}), systemAction('2', {actorAccountID: 2})];
            expect(getSystemMessageDisplayState(actions, new Set()).displayReportActions).toEqual([actions.at(0)]);
        });

        it.each([
            ['2026-03-08 00:00:00.000', '2026-03-09 01:00:00.000', 2],
            ['2026-11-01 00:00:00.000', '2026-11-02 00:00:00.000', 1],
        ])('applies elapsed UTC hours across daylight-saving dates: %s to %s', (firstCreated, secondCreated, expectedRows) => {
            const actions = [systemAction('1', {created: firstCreated}), systemAction('2', {created: secondCreated})];
            expect(getSystemMessageDisplayState(actions, new Set()).displayReportActions).toHaveLength(expectedRows);
        });

        it('does not combine admin-submitted or automated updates with a different displayed actor', () => {
            const actions = [
                makeAction('1', CONST.REPORT.ACTIONS.TYPE.SUBMITTED, {adminAccountID: 2}),
                makeAction('2', CONST.REPORT.ACTIONS.TYPE.SUBMITTED),
                makeAction('3', CONST.REPORT.ACTIONS.TYPE.APPROVED, {originalMessage: {amount: 100, currency: CONST.CURRENCY.USD, expenseReportID: 'report', automaticAction: true}}),
            ];
            expect(getSystemMessageDisplayState(actions, new Set()).displayReportActions).toEqual(actions);
        });

        it('does not combine Concierge updates assisted by different human agents', () => {
            const firstMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE>['originalMessage'] & {humanAgentAccountID: number} = {humanAgentAccountID: 2};
            const secondMessage: typeof firstMessage = {humanAgentAccountID: 3};
            const actions = [
                systemAction('1', {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, originalMessage: firstMessage}),
                systemAction('2', {actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, originalMessage: secondMessage}),
            ];
            expect(getSystemMessageDisplayState(actions, new Set()).displayReportActions).toEqual(actions);
        });

        it('restores descending order and canonical indices when expanding an inverted run', () => {
            const actions = [systemAction('3'), systemAction('2'), systemAction('1')];
            const state = getSystemMessageDisplayState(actions, new Set(['2']));
            expect(state.displayReportActions).toEqual(actions);
            expect(state.reportActionIDToDisplayIndex.get('3')).toBe(0);
            expect(state.reportActionIDToDisplayIndex.get('1')).toBe(2);
        });

        it('maps an unread member to a collapsed anchor without expanding the run', () => {
            const actions = [systemAction('1'), systemAction('2'), systemAction('3')];
            const state = getSystemMessageDisplayState(actions, new Set());

            expect(state.displayReportActions).toEqual([actions.at(0)]);
            expect(state.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(false);
            expect(state.reportActionIDToDisplayIndex.get('2')).toBe(0);
        });

        it('keeps an expanded run open when pagination adds a new adjacent member', () => {
            const originalActions = [systemAction('2'), systemAction('3')];
            const originalState = getSystemMessageDisplayState(originalActions, new Set(['2', '3']));
            const paginatedState = getSystemMessageDisplayState([systemAction('1'), ...originalActions], new Set(originalState.runsByAnchorReportActionID.get('2')?.reportActionIDs));

            expect(paginatedState.displayReportActions.map((action) => action.reportActionID)).toEqual(['1', '2', '3']);
            expect(paginatedState.runsByAnchorReportActionID.get('1')?.isExpanded).toBe(true);
        });
    });
});
