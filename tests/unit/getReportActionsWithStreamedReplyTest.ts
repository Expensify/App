import getReportActionsWithStreamedReply from '@pages/inbox/report/ReportActionsList/getReportActionsWithStreamedReply';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

function createAction(reportActionID: string, created: string): ReportAction {
    return {reportActionID, created, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, actorAccountID: 1, message: [{type: 'COMMENT', text: reportActionID, html: reportActionID}]};
}

const newer = createAction('newer', '2026-01-03 00:00:00.000');
const older = createAction('older', '2026-01-01 00:00:00.000');
const reply = createAction('reply', '2026-01-02 00:00:00.000');
const actions = [newer, older];
Object.freeze(actions);
Object.freeze(newer);
Object.freeze(older);

const defaults = {sortedVisibleReportActions: actions, draftReportAction: reply, isDraftPendingCompletion: true, hasPersistedDraft: false, shouldHideDraft: false};

describe('getReportActionsWithStreamedReply', () => {
    it.each([
        {label: 'no reply', overrides: {draftReportAction: null}},
        {label: 'a reply excluded by hidden history', overrides: {shouldHideDraft: true}},
        {label: 'a completed saved reply outside the page', overrides: {hasPersistedDraft: true, isDraftPendingCompletion: false}},
    ])('preserves the input array for $label', ({overrides}) => {
        // Given a reply which does not need a synthetic row.
        const params = {...defaults, ...overrides};
        // When the insertion decision is made.
        const result = getReportActionsWithStreamedReply(params);
        // Then no copy or synthetic reply is introduced.
        expect(result.reportActionsWithStreamedReply).toBe(actions);
        expect(result.isSyntheticDraftVisible).toBe(false);
    });

    it.each([
        {created: '2026-01-04 00:00:00.000', expected: ['reply', 'newer', 'older']},
        {created: '2026-01-02 00:00:00.000', expected: ['newer', 'reply', 'older']},
        {created: '2025-12-31 00:00:00.000', expected: ['newer', 'older', 'reply']},
    ])('inserts a reply created at $created in newest-first order', ({created, expected}) => {
        // Given a reply that belongs before, between, or after the visible actions.
        const draftReportAction = createAction('reply', created);
        // When it is included in the list.
        const result = getReportActionsWithStreamedReply({...defaults, draftReportAction});
        // Then the source is untouched and only the required array copy is returned.
        expect(result.reportActionsWithStreamedReply.map((action) => action.reportActionID)).toEqual(expected);
        expect(result.reportActionsWithStreamedReply).not.toBe(actions);
        expect(result.isSyntheticDraftVisible).toBe(true);
        expect(actions).toEqual([newer, older]);
    });

    it('replaces a matching action while the reply is revealing, even if a saved counterpart exists', () => {
        // Given a saved counterpart whose streamed text has not finished revealing.
        const savedReply = {...reply, message: [{type: 'COMMENT' as const, text: 'saved', html: 'saved'}]};
        const source = [newer, savedReply, older];
        Object.freeze(source);
        // When the partial reply takes its place temporarily.
        const result = getReportActionsWithStreamedReply({...defaults, sortedVisibleReportActions: source, hasPersistedDraft: true});
        // Then it replaces rather than duplicates the action and preserves the saved source.
        expect(result.reportActionsWithStreamedReply).toEqual([newer, reply, older]);
        expect(result.reportActionsWithStreamedReply.at(1)).toBe(reply);
        expect(source.at(1)).toBe(savedReply);
        expect(result.isSyntheticDraftVisible).toBe(true);
    });

    it('keeps a completed matching optimistic action with its pending-add flag', () => {
        // Given an optimistic placeholder with followups merged after the reveal completed.
        const placeholder = {...reply, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        const source = [newer, placeholder, older];
        // When completion is known but no confirmed saved action has been found.
        const result = getReportActionsWithStreamedReply({...defaults, sortedVisibleReportActions: source, isDraftPendingCompletion: false});
        // Then the placeholder stays authoritative without a synthetic copy.
        expect(result.reportActionsWithStreamedReply).toBe(source);
        expect(result.isSyntheticDraftVisible).toBe(false);
    });

    it('preserves equal-timestamp action-ID ordering', () => {
        // Given equally timed actions sorted by their IDs.
        const timestamp = reply.created;
        const source = [createAction('20', timestamp), createAction('10', timestamp)];
        // When a reply with an intermediate ID arrives.
        const result = getReportActionsWithStreamedReply({...defaults, sortedVisibleReportActions: source, draftReportAction: createAction('15', timestamp)});
        // Then the existing report-action comparator decides its position.
        expect(result.reportActionsWithStreamedReply.map((action) => action.reportActionID)).toEqual(['20', '15', '10']);
        expect(result.isSyntheticDraftVisible).toBe(true);
    });

    it('keeps CREATED logically oldest even when its timestamp is newer', () => {
        // Given a synthetic CREATED action whose timestamp is ahead of the reply.
        const created = {...createAction('created', '2030-01-01 00:00:00.000'), actionName: CONST.REPORT.ACTIONS.TYPE.CREATED};
        // When the reply is inserted into that list.
        const result = getReportActionsWithStreamedReply({...defaults, sortedVisibleReportActions: [created]});
        // Then CREATED remains the oldest row rather than taking timestamp precedence.
        expect(result.reportActionsWithStreamedReply).toEqual([reply, created]);
        expect(result.isSyntheticDraftVisible).toBe(true);
    });

    it('inserts into an empty page', () => {
        // Given no visible actions and a reply that still needs to be shown.
        const source: ReportAction[] = [];
        // When the reply is included.
        const result = getReportActionsWithStreamedReply({...defaults, sortedVisibleReportActions: source});
        // Then the reply is present without mutating the empty source.
        expect(result.reportActionsWithStreamedReply).toEqual([reply]);
        expect(source).toEqual([]);
        expect(result.isSyntheticDraftVisible).toBe(true);
    });
});
