import {applyConciergeDraftEvent, getCachedDraft, setCachedDraft} from '@pages/inbox/conciergeDraftState';
import CONST from '@src/CONST';

const REPORT_ID = '123';
const REPORT_ACTION_ID = '456';
const CREATED = '2026-04-03 10:00:00.000';
const STREAM_SESSION_ID = 'stream-session-1';

function createDraftEvent(overrides?: Partial<Parameters<typeof applyConciergeDraftEvent>[1]>) {
    return {
        reportID: REPORT_ID,
        reportActionID: REPORT_ACTION_ID,
        streamSessionID: STREAM_SESSION_ID,
        sequence: 1,
        status: 'started' as const,
        created: CREATED,
        bodyMarkdown: 'Hello, **world**!',
        ...overrides,
    };
}

function getFirstMessageHTML(draft: ReturnType<typeof applyConciergeDraftEvent>) {
    const message = draft?.reportAction.message;

    if (!Array.isArray(message)) {
        return undefined;
    }

    return message.at(0)?.html;
}

function getFirstMessageText(draft: ReturnType<typeof applyConciergeDraftEvent>) {
    const message = draft?.reportAction.message;

    if (!Array.isArray(message)) {
        return undefined;
    }

    return message.at(0)?.text;
}

describe('conciergeDraftState', () => {
    it('should create a synthetic Concierge draft action from the first streamed snapshot', () => {
        const draft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);

        expect(draft?.reportAction.reportActionID).toBe(REPORT_ACTION_ID);
        expect(draft?.reportAction.actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);
        expect(draft?.reportAction.created).toBe(CREATED);
        expect(getFirstMessageHTML(draft)).toContain('<strong>world</strong>');
        expect(getFirstMessageText(draft)).toBe('Hello, *world*!');
    });

    it('should update the same draft session when a newer sequence arrives', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);
        const updatedDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'updated',
                bodyMarkdown: 'Hello, **streaming** world!',
            }),
            REPORT_ID,
        );

        expect(updatedDraft?.sequence).toBe(2);
        expect(getFirstMessageHTML(updatedDraft)).toContain('<strong>streaming</strong>');
    });

    it('should ignore stale events from the same stream session', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent({sequence: 3}), REPORT_ID);
        const staleDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'updated',
                bodyMarkdown: 'This should be ignored',
            }),
            REPORT_ID,
        );

        expect(staleDraft).toBe(initialDraft);
        expect(getFirstMessageText(staleDraft)).toBe('Hello, *world*!');
    });

    it('should keep the draft visible through completion and prefer finalRenderedHTML when provided', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);
        const completedDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'completed',
                finalRenderedHTML: '<comment><strong>Server rendered</strong></comment>',
                bodyMarkdown: undefined,
            }),
            REPORT_ID,
        );

        expect(completedDraft?.status).toBe('completed');
        expect(getFirstMessageHTML(completedDraft)).toBe('<comment><strong>Server rendered</strong></comment>');
        expect(getFirstMessageText(completedDraft)).toBe('Server rendered');
    });

    it('should clear the active draft when the same stream session fails', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);
        const failedDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'failed',
                terminalReason: 'lostLease',
                bodyMarkdown: undefined,
            }),
            REPORT_ID,
        );

        expect(failedDraft).toBeNull();
    });

    it('should ignore events for a different report', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);
        const otherReportDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                reportID: '999',
                sequence: 2,
                status: 'updated',
                bodyMarkdown: 'Different report',
            }),
            REPORT_ID,
        );

        expect(otherReportDraft).toBe(initialDraft);
    });

    describe('draftCache', () => {
        // Always start clean so tests don't leak state into each other.
        beforeEach(() => {
            setCachedDraft(REPORT_ID, null);
        });

        it('returns null for an unseen reportID', () => {
            expect(getCachedDraft('never-stored')).toBeNull();
        });

        it('persists a draft across set/get and survives across calls (the remount survival contract)', () => {
            const draft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);
            expect(draft).not.toBeNull();
            setCachedDraft(REPORT_ID, draft);
            expect(getCachedDraft(REPORT_ID)).toBe(draft);
            // Simulating a remount: a fresh getCachedDraft call returns the same instance.
            expect(getCachedDraft(REPORT_ID)).toBe(draft);
        });

        it('evicts when set to null (completed/failed/cleared reducer return)', () => {
            const draft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);
            setCachedDraft(REPORT_ID, draft);
            expect(getCachedDraft(REPORT_ID)).not.toBeNull();
            setCachedDraft(REPORT_ID, null);
            expect(getCachedDraft(REPORT_ID)).toBeNull();
        });

        it('keeps entries scoped per reportID (no cross-talk)', () => {
            const draftA = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID);
            const draftB = applyConciergeDraftEvent(null, createDraftEvent({reportID: 'other'}), 'other');
            setCachedDraft(REPORT_ID, draftA);
            setCachedDraft('other', draftB);
            expect(getCachedDraft(REPORT_ID)).toBe(draftA);
            expect(getCachedDraft('other')).toBe(draftB);
        });
    });
});
