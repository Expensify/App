import {
    applyConciergeDraftEvent,
    getCachedDraft,
    getNextVisibleConciergeDraftBodyMarkdown,
    getNextVisibleConciergeDraftMarkdown,
    setCachedDraft,
    stripIncompleteMarkdown,
} from '@pages/inbox/conciergeDraftState';

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
        const draft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);

        expect(draft?.bodyMarkdown).toBe('Hello, **world**!');
        expect(draft?.reportAction.reportActionID).toBe(REPORT_ACTION_ID);
        expect(draft?.reportAction.actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);
        expect(draft?.reportAction.created).toBe(CREATED);
        expect(getFirstMessageHTML(draft)).toContain('<strong>world</strong>');
        expect(getFirstMessageText(draft)).toBe('Hello, world!');
    });

    it('should update the same draft session when a newer sequence arrives', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);
        const updatedDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'updated',
                bodyMarkdown: 'Hello, **streaming** world!',
            }),
            REPORT_ID,
            false,
        );

        expect(updatedDraft?.sequence).toBe(2);
        expect(updatedDraft?.bodyMarkdown).toBe('Hello, **streaming** world!');
        expect(getFirstMessageHTML(updatedDraft)).toContain('<strong>streaming</strong>');
    });

    it('should render streamed Common Markdown single-star emphasis as italic', () => {
        const draft = applyConciergeDraftEvent(null, createDraftEvent({bodyMarkdown: 'Hello, *streaming* world!'}), REPORT_ID, false);

        expect(getFirstMessageHTML(draft)).toContain('<em>streaming</em>');
        expect(getFirstMessageHTML(draft)).not.toContain('<strong>streaming</strong>');
    });

    it('should ignore stale events from the same stream session', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent({sequence: 3}), REPORT_ID, false);
        const staleDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'updated',
                bodyMarkdown: 'This should be ignored',
            }),
            REPORT_ID,
            false,
        );

        expect(staleDraft).toBe(initialDraft);
        expect(getFirstMessageText(staleDraft)).toBe('Hello, world!');
    });

    it('should keep the draft visible through completion and prefer finalRenderedHTML when provided', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);
        const completedDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'completed',
                finalRenderedHTML: '<comment><strong>Server rendered</strong></comment>',
                bodyMarkdown: undefined,
            }),
            REPORT_ID,
            false,
        );

        expect(completedDraft?.status).toBe('completed');
        expect(getFirstMessageHTML(completedDraft)).toBe('<comment><strong>Server rendered</strong></comment>');
        expect(getFirstMessageText(completedDraft)).toBe('Server rendered');
    });

    it('should clear the active draft when the same stream session fails', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);
        const failedDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                sequence: 2,
                status: 'failed',
                terminalReason: 'lostLease',
                bodyMarkdown: undefined,
            }),
            REPORT_ID,
            false,
        );

        expect(failedDraft).toBeNull();
    });

    it('should ignore events for a different report', () => {
        const initialDraft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);
        const otherReportDraft = applyConciergeDraftEvent(
            initialDraft,
            createDraftEvent({
                reportID: '999',
                sequence: 2,
                status: 'updated',
                bodyMarkdown: 'Different report',
            }),
            REPORT_ID,
            false,
        );

        expect(otherReportDraft).toBe(initialDraft);
    });

    describe('getNextVisibleConciergeDraftBodyMarkdown', () => {
        it('handles normal reveal, code points, and corrections', () => {
            // Given representative pacing inputs
            const longTarget = 'a'.repeat(200);

            // When calculating the next visible body
            const firstSlice = getNextVisibleConciergeDraftBodyMarkdown('', 'Hello');
            const secondSlice = getNextVisibleConciergeDraftBodyMarkdown('H', 'Hello');
            const emojiSlice = getNextVisibleConciergeDraftBodyMarkdown('Hi ', 'Hi 😃 there');
            const longBacklogSlice = getNextVisibleConciergeDraftBodyMarkdown('', longTarget);
            const correctedSlice = getNextVisibleConciergeDraftBodyMarkdown('Old draft', 'New draft');

            // Then each pacing path preserves its expected reveal behavior
            expect(firstSlice).toBe('H');
            expect(secondSlice).toBe('He');
            expect(emojiSlice).toBe('Hi 😃');
            expect(longBacklogSlice).toBe('a');
            expect(correctedSlice).toBe('New draft');
        });
    });

    describe('getNextVisibleConciergeDraftMarkdown', () => {
        it('streams complete bold markup by visible characters while keeping the style active', () => {
            const firstBoldSlice = getNextVisibleConciergeDraftMarkdown('Hello ', 'Hello **world**!', 'Hello '.length, 'Hello ');
            const secondBoldSlice = getNextVisibleConciergeDraftMarkdown(firstBoldSlice.bodyMarkdown, 'Hello **world**!', firstBoldSlice.sourceOffset, firstBoldSlice.sourceMarkdown);

            expect(firstBoldSlice.bodyMarkdown).toBe('Hello **w**');
            expect(firstBoldSlice.sourceMarkdown).toBe('Hello **w');
            expect(secondBoldSlice.bodyMarkdown).toBe('Hello **wo**');
            expect(secondBoldSlice.sourceMarkdown).toBe('Hello **wo');
        });

        it('keeps temporary bold markup valid when the visible content ends in whitespace', () => {
            const spaceSlice = getNextVisibleConciergeDraftMarkdown('Hello **QuickBooks**', 'Hello **QuickBooks Online**', 'Hello **QuickBooks'.length, 'Hello **QuickBooks');
            const draft = applyConciergeDraftEvent(null, createDraftEvent({bodyMarkdown: spaceSlice.bodyMarkdown}), REPORT_ID, false);

            expect(spaceSlice.bodyMarkdown).toBe('Hello **QuickBooks** ');
            expect(spaceSlice.sourceMarkdown).toBe('Hello **QuickBooks ');
            expect(stripIncompleteMarkdown(spaceSlice.bodyMarkdown)).toBe('Hello *QuickBooks* ');
            expect(getFirstMessageHTML(draft)).toContain('<strong>QuickBooks</strong>');
            expect(getFirstMessageHTML(draft)).not.toContain('*QuickBooks');
        });

        it('streams complete strikethrough and inline code markup by visible characters', () => {
            const strikeSlice = getNextVisibleConciergeDraftMarkdown('Remove ', 'Remove ~~this~~', 'Remove '.length, 'Remove ');
            const codeSlice = getNextVisibleConciergeDraftMarkdown('Run ', 'Run `npm test`', 'Run '.length, 'Run ');

            expect(strikeSlice.bodyMarkdown).toBe('Remove ~~t~~');
            expect(codeSlice.bodyMarkdown).toBe('Run `n`');
        });

        it('streams complete italic markup by visible characters while keeping the style active', () => {
            const italicSlice = getNextVisibleConciergeDraftMarkdown('Hello ', 'Hello *world*!', 'Hello '.length, 'Hello ');

            expect(italicSlice.bodyMarkdown).toBe('Hello *w*');
            expect(italicSlice.sourceMarkdown).toBe('Hello *w');
            expect(stripIncompleteMarkdown(italicSlice.bodyMarkdown)).toBe('Hello _w_');
        });

        it('keeps temporary italic markup valid when the visible content ends in whitespace', () => {
            const spaceSlice = getNextVisibleConciergeDraftMarkdown('Hello *QuickBooks*', 'Hello *QuickBooks Online*', 'Hello *QuickBooks'.length, 'Hello *QuickBooks');

            expect(spaceSlice.bodyMarkdown).toBe('Hello *QuickBooks* ');
            expect(spaceSlice.sourceMarkdown).toBe('Hello *QuickBooks ');
            expect(stripIncompleteMarkdown(spaceSlice.bodyMarkdown)).toBe('Hello _QuickBooks_ ');
        });

        it('streams complete links by linked text without exposing the destination URL as plain text', () => {
            const linkSlice = getNextVisibleConciergeDraftMarkdown('See ', 'See [docs](https://example.com)', 'See '.length, 'See ');

            expect(linkSlice.bodyMarkdown).toBe('See [d](https://example.com)');
            expect(linkSlice.sourceMarkdown).toBe('See [d');
        });

        it('does not consume hidden source text while markdown is still incomplete', () => {
            const boldSlice = getNextVisibleConciergeDraftMarkdown('Hello ', 'Hello **world', 'Hello '.length, 'Hello ');
            const italicSlice = getNextVisibleConciergeDraftMarkdown('Hello ', 'Hello *world', 'Hello '.length, 'Hello ');
            const linkSlice = getNextVisibleConciergeDraftMarkdown('See ', 'See [docs](https://example', 'See '.length, 'See ');

            expect(boldSlice.bodyMarkdown).toBe('Hello ');
            expect(boldSlice.sourceMarkdown).toBe('Hello ');
            expect(boldSlice.sourceOffset).toBe('Hello '.length);
            expect(italicSlice.bodyMarkdown).toBe('Hello ');
            expect(italicSlice.sourceMarkdown).toBe('Hello ');
            expect(italicSlice.sourceOffset).toBe('Hello '.length);
            expect(linkSlice.bodyMarkdown).toBe('See ');
            expect(linkSlice.sourceMarkdown).toBe('See ');
            expect(linkSlice.sourceOffset).toBe('See '.length);
        });

        it('uses source markdown to keep moving smoothly when a previously incomplete span becomes complete', () => {
            const targetWithCompletedBold = 'Hello **world**';
            const nextSlice = getNextVisibleConciergeDraftMarkdown('Hello ', targetWithCompletedBold, 'Hello '.length, 'Hello ');

            expect(nextSlice.bodyMarkdown).toBe('Hello **w**');
            expect(nextSlice.sourceMarkdown).toBe('Hello **w');
        });
    });

    describe('stripIncompleteMarkdown', () => {
        it('returns empty/falsy values unchanged', () => {
            expect(stripIncompleteMarkdown('')).toBe('');
        });

        it('does not alter complete markdown', () => {
            const complete = 'Hello _italic_ and [link](https://example.com) and `code`';
            expect(stripIncompleteMarkdown(complete)).toBe(complete);
        });

        it('normalizes complete Markdown emphasis for ExpensiMark', () => {
            expect(stripIncompleteMarkdown('Hello **bold**, *italic*, and ~~strike~~')).toBe('Hello *bold*, _italic_, and ~strike~');
        });

        // --- Links / Images ---
        it('strips an incomplete link with only opening bracket', () => {
            expect(stripIncompleteMarkdown('Check out [')).toBe('Check out ');
        });

        it('strips an incomplete link with text but no closing bracket', () => {
            expect(stripIncompleteMarkdown('Check out [this page')).toBe('Check out ');
        });

        it('strips an incomplete link with bracket closed but no URL', () => {
            expect(stripIncompleteMarkdown('Check out [link](')).toBe('Check out ');
        });

        it('strips an incomplete link with partial URL', () => {
            expect(stripIncompleteMarkdown('Check out [link](https://example')).toBe('Check out ');
        });

        it('preserves a complete link followed by an incomplete one', () => {
            expect(stripIncompleteMarkdown('[done](https://a.com) and [broken')).toBe('[done](https://a.com) and ');
        });

        it('preserves bracketed text that is not a link', () => {
            const complete = 'The accepted values are [yes/no] for this setting';
            expect(stripIncompleteMarkdown(complete)).toBe(complete);
        });

        it('strips an incomplete image syntax', () => {
            expect(stripIncompleteMarkdown('Here is ![alt')).toBe('Here is ');
        });

        // --- Bold (**) ---
        it('strips trailing unclosed bold', () => {
            expect(stripIncompleteMarkdown('Hello **world')).toBe('Hello ');
        });

        it('strips bare trailing ** delimiter', () => {
            expect(stripIncompleteMarkdown('Hello **')).toBe('Hello ');
        });

        it('preserves complete bold and strips only the unclosed one', () => {
            expect(stripIncompleteMarkdown('**done** and **broken')).toBe('*done* and ');
        });

        // --- Italic (*) ---
        it('strips trailing unclosed italic', () => {
            expect(stripIncompleteMarkdown('Hello *world')).toBe('Hello ');
        });

        it('preserves complete italic and strips only the unclosed one', () => {
            expect(stripIncompleteMarkdown('*done* and *broken')).toBe('_done_ and ');
        });

        it('does not treat bullet markers or multiplication as italic', () => {
            expect(stripIncompleteMarkdown('* item')).toBe('* item');
            expect(stripIncompleteMarkdown('2 * 3 = 6')).toBe('2 * 3 = 6');
        });

        // --- Strikethrough (~~) ---
        it('strips trailing unclosed strikethrough', () => {
            expect(stripIncompleteMarkdown('Hello ~~strike')).toBe('Hello ');
        });

        // --- Code blocks (```) ---
        it('strips an unclosed code block', () => {
            expect(stripIncompleteMarkdown('Here:\n```\ncode')).toBe('Here:\n');
        });

        it('preserves a complete code block', () => {
            const complete = 'Before\n```\ncode\n```\nAfter';
            expect(stripIncompleteMarkdown(complete)).toBe(complete);
        });

        it('preserves a complete code block ending at the closing fence', () => {
            const complete = 'Before\n```\ncode\n```';
            expect(stripIncompleteMarkdown(complete)).toBe(complete);
        });

        // --- Inline code (`) ---
        it('strips trailing unclosed inline code', () => {
            expect(stripIncompleteMarkdown('Run `command')).toBe('Run ');
        });

        it('preserves complete inline code', () => {
            const complete = 'Run `command` now';
            expect(stripIncompleteMarkdown(complete)).toBe(complete);
        });

        it('preserves markdown-looking text inside complete inline code', () => {
            const complete = 'Use `[accountID]` and `**not bold` in the payload';
            expect(stripIncompleteMarkdown(complete)).toBe(complete);
        });

        // --- Streaming integration ---
        it('keeps complete double-delimiter bold styled without showing raw delimiters during streaming', () => {
            const draft = applyConciergeDraftEvent(null, createDraftEvent({bodyMarkdown: 'Hello **bold**!'}), REPORT_ID, false);

            expect(getFirstMessageHTML(draft)).toContain('<strong>bold</strong>');
            expect(getFirstMessageHTML(draft)).not.toContain('*');
        });

        it('keeps complete single-delimiter italic styled without rendering it as bold during streaming', () => {
            const draft = applyConciergeDraftEvent(null, createDraftEvent({bodyMarkdown: 'Hello *italic*!'}), REPORT_ID, false);

            expect(getFirstMessageHTML(draft)).toContain('<em>italic</em>');
            expect(getFirstMessageHTML(draft)).not.toContain('<strong>italic</strong>');
            expect(getFirstMessageHTML(draft)).not.toContain('*');
        });

        it('strips incomplete markdown during a streaming draft event', () => {
            const draft = applyConciergeDraftEvent(null, createDraftEvent({bodyMarkdown: 'Check [this link'}), REPORT_ID, false);
            // The raw '[this link' syntax should NOT appear in the rendered HTML
            expect(getFirstMessageHTML(draft)).not.toContain('[this link');
        });
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
            const draft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);
            expect(draft).not.toBeNull();
            setCachedDraft(REPORT_ID, draft);
            expect(getCachedDraft(REPORT_ID)).toBe(draft);
            // Simulating a remount: a fresh getCachedDraft call returns the same instance.
            expect(getCachedDraft(REPORT_ID)).toBe(draft);
        });

        it('evicts when set to null (completed/failed/cleared reducer return)', () => {
            const draft = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);
            setCachedDraft(REPORT_ID, draft);
            expect(getCachedDraft(REPORT_ID)).not.toBeNull();
            setCachedDraft(REPORT_ID, null);
            expect(getCachedDraft(REPORT_ID)).toBeNull();
        });

        it('keeps entries scoped per reportID (no cross-talk)', () => {
            const draftA = applyConciergeDraftEvent(null, createDraftEvent(), REPORT_ID, false);
            const draftB = applyConciergeDraftEvent(null, createDraftEvent({reportID: 'other'}), 'other', false);
            setCachedDraft(REPORT_ID, draftA);
            setCachedDraft('other', draftB);
            expect(getCachedDraft(REPORT_ID)).toBe(draftA);
            expect(getCachedDraft('other')).toBe(draftB);
        });
    });
});
