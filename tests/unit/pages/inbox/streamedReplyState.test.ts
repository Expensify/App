import {applyStreamedReplyEvent, getCachedReply, getNextVisibleStreamedReplyMarkdown, setCachedReply, stripIncompleteMarkdown} from '@pages/inbox/streamedReplyState';

import CONST from '@src/CONST';

const REPORT_ID = '123';
const REPORT_ACTION_ID = '456';
const CREATED = '2026-04-03 10:00:00.000';
const STREAM_SESSION_ID = 'stream-session-1';

function createDraftEvent(overrides?: Partial<Parameters<typeof applyStreamedReplyEvent>[1]>) {
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

function getFirstMessageHTML(reply: ReturnType<typeof applyStreamedReplyEvent>) {
    const message = reply?.reportAction.message;

    if (!Array.isArray(message)) {
        return undefined;
    }

    return message.at(0)?.html;
}

function getFirstMessageText(reply: ReturnType<typeof applyStreamedReplyEvent>) {
    const message = reply?.reportAction.message;

    if (!Array.isArray(message)) {
        return undefined;
    }

    return message.at(0)?.text;
}

describe('streamedReplyState', () => {
    it('should create a synthetic Concierge draft action from the first streamed snapshot', () => {
        const reply = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);

        expect(reply?.bodyMarkdown).toBe('Hello, **world**!');
        expect(reply?.reportAction.reportActionID).toBe(REPORT_ACTION_ID);
        expect(reply?.reportAction.actorAccountID).toBe(CONST.ACCOUNT_ID.CONCIERGE);
        expect(reply?.reportAction.created).toBe(CREATED);
        expect(getFirstMessageHTML(reply)).toContain('<strong>world</strong>');
        expect(getFirstMessageText(reply)).toBe('Hello, world!');
    });

    it('should update the same draft session when a newer sequence arrives', () => {
        const initialDraft = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);
        const updatedDraft = applyStreamedReplyEvent(
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
        const reply = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: 'Hello, *streaming* world!'}), REPORT_ID, false);

        expect(getFirstMessageHTML(reply)).toContain('<em>streaming</em>');
        expect(getFirstMessageHTML(reply)).not.toContain('<strong>streaming</strong>');
    });

    it('keeps canonical entity Markdown while displaying only the prefix until final HTML arrives', () => {
        // Given an entity split across streamed snapshots
        const bodyMarkdown = '**Lunch** &copy client &lt;client team&gt; &#42;alpha&#42; &amp;lt;literal&amp;gt;';
        const initialDraft = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: '**Lunch** &'}), REPORT_ID, false);
        expect(getFirstMessageText(initialDraft)).toBe('Lunch ');

        // When the complete source arrives, the draft must not display double-escaped entities
        const updatedDraft = applyStreamedReplyEvent(initialDraft, createDraftEvent({sequence: 2, status: 'updated', bodyMarkdown}), REPORT_ID, false);
        expect(updatedDraft?.bodyMarkdown).toBe(bodyMarkdown);
        expect(updatedDraft?.sequence).toBe(2);
        expect(updatedDraft?.streamSessionID).toBe(STREAM_SESSION_ID);
        expect(updatedDraft?.reportAction.reportActionID).toBe(REPORT_ACTION_ID);
        expect(getFirstMessageHTML(updatedDraft)).toContain('<strong>Lunch</strong>');
        expect(getFirstMessageText(updatedDraft)).toBe('Lunch ');

        // Then server-rendered HTML reveals the exact literal text in the same action
        const finalRenderedHTML = '<comment><strong>Lunch</strong> &copy client &lt;client team&gt; &#42;alpha&#42; &amp;lt;literal&amp;gt;</comment>';
        const completedDraft = applyStreamedReplyEvent(updatedDraft, createDraftEvent({sequence: 3, status: 'completed', bodyMarkdown, finalRenderedHTML}), REPORT_ID, false);
        expect(completedDraft?.bodyMarkdown).toBe(bodyMarkdown);
        expect(completedDraft?.status).toBe('completed');
        expect(completedDraft?.reportAction.reportActionID).toBe(REPORT_ACTION_ID);
        expect(getFirstMessageHTML(completedDraft)).toBe(finalRenderedHTML);
        expect(getFirstMessageText(completedDraft)).toBe('Lunch © client <client team> *alpha* &lt;literal&gt;');
    });

    it('waits for final HTML when an entity starts the draft', () => {
        // Given a draft whose first character could start an encoded literal
        const initialDraft = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: '&'}), REPORT_ID, false);
        expect(initialDraft).toBeNull();

        // When the entity completes, there is still no prefix that the client can safely render
        const bodyMarkdown = '&lt;client team&gt;';
        const updatedDraft = applyStreamedReplyEvent(initialDraft, createDraftEvent({sequence: 2, status: 'updated', bodyMarkdown}), REPORT_ID, false);
        expect(updatedDraft).toBeNull();

        // Then final HTML creates the intended action without displaying entity syntax
        const finalRenderedHTML = '<comment>&lt;client team&gt;</comment>';
        const completedDraft = applyStreamedReplyEvent(updatedDraft, createDraftEvent({sequence: 3, status: 'completed', bodyMarkdown, finalRenderedHTML}), REPORT_ID, false);
        expect(completedDraft?.reportAction.reportActionID).toBe(REPORT_ACTION_ID);
        expect(getFirstMessageHTML(completedDraft)).toBe(finalRenderedHTML);
        expect(getFirstMessageText(completedDraft)).toBe('<client team>');
    });

    it('resumes a draft when later text resolves a trailing ampersand', () => {
        // Given a draft ending with a possible entity opener
        const initial = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: 'Manufacturing &'}), REPORT_ID, false);
        expect(getFirstMessageText(initial)).toBe('Manufacturing ');

        // When later snapshots identify literal text and a query-string ampersand
        const bodyMarkdown = 'Manufacturing & Wholesale, R&D; review it tomorrow: https://example.com/?one=1&two=2';
        const updated = applyStreamedReplyEvent(initial, createDraftEvent({sequence: 2, status: 'updated', bodyMarkdown}), REPORT_ID, false);

        // Then the whole draft is visible before the completed event
        expect(getFirstMessageText(updated)).toBe(bodyMarkdown);
        expect(updated?.status).toBe('updated');
    });

    it('continues past an ordinary ampersand before final HTML arrives', () => {
        // Given an ordinary draft that contains an ampersand rather than an entity
        const bodyMarkdown = 'Lunch & dinner';

        // When rendering Markdown, the following space identifies the ampersand as literal text
        const reply = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown}), REPORT_ID, false);
        expect(reply?.bodyMarkdown).toBe(bodyMarkdown);
        expect(getFirstMessageText(reply)).toBe('Lunch & dinner');

        // Then final HTML reveals the complete text without truncation
        const completedDraft = applyStreamedReplyEvent(
            reply,
            createDraftEvent({sequence: 2, status: 'completed', bodyMarkdown, finalRenderedHTML: '<comment>Lunch &amp; dinner</comment>'}),
            REPORT_ID,
            false,
        );
        expect(getFirstMessageText(completedDraft)).toBe(bodyMarkdown);
    });

    it('should ignore stale events from the same stream session', () => {
        const initialDraft = applyStreamedReplyEvent(null, createDraftEvent({sequence: 3}), REPORT_ID, false);
        const staleDraft = applyStreamedReplyEvent(
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
        const initialDraft = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);
        const completedDraft = applyStreamedReplyEvent(
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
        const initialDraft = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);
        const failedDraft = applyStreamedReplyEvent(
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
        const initialDraft = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);
        const otherReportDraft = applyStreamedReplyEvent(
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

    describe('getNextVisibleStreamedReplyMarkdown', () => {
        it('streams complete bold markup by visible characters while keeping the style active', () => {
            const firstBoldSlice = getNextVisibleStreamedReplyMarkdown('Hello ', 'Hello **world**!', 'Hello '.length, 'Hello ');
            const secondBoldSlice = getNextVisibleStreamedReplyMarkdown(firstBoldSlice.bodyMarkdown, 'Hello **world**!', firstBoldSlice.sourceOffset, firstBoldSlice.sourceMarkdown);

            expect(firstBoldSlice.bodyMarkdown).toBe('Hello **w**');
            expect(firstBoldSlice.sourceMarkdown).toBe('Hello **w');
            expect(secondBoldSlice.bodyMarkdown).toBe('Hello **wo**');
            expect(secondBoldSlice.sourceMarkdown).toBe('Hello **wo');
        });

        it('keeps temporary bold markup valid when the visible content ends in whitespace', () => {
            const spaceSlice = getNextVisibleStreamedReplyMarkdown('Hello **QuickBooks**', 'Hello **QuickBooks Online**', 'Hello **QuickBooks'.length, 'Hello **QuickBooks');
            const reply = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: spaceSlice.bodyMarkdown}), REPORT_ID, false);

            expect(spaceSlice.bodyMarkdown).toBe('Hello **QuickBooks** ');
            expect(spaceSlice.sourceMarkdown).toBe('Hello **QuickBooks ');
            expect(stripIncompleteMarkdown(spaceSlice.bodyMarkdown)).toBe('Hello *QuickBooks* ');
            expect(getFirstMessageHTML(reply)).toContain('<strong>QuickBooks</strong>');
            expect(getFirstMessageHTML(reply)).not.toContain('*QuickBooks');
        });

        it('streams complete strikethrough and inline code markup by visible characters', () => {
            const strikeSlice = getNextVisibleStreamedReplyMarkdown('Remove ', 'Remove ~~this~~', 'Remove '.length, 'Remove ');
            const codeSlice = getNextVisibleStreamedReplyMarkdown('Run ', 'Run `npm test`', 'Run '.length, 'Run ');

            expect(strikeSlice.bodyMarkdown).toBe('Remove ~~t~~');
            expect(codeSlice.bodyMarkdown).toBe('Run `n`');
        });

        it('streams complete italic markup by visible characters while keeping the style active', () => {
            const italicSlice = getNextVisibleStreamedReplyMarkdown('Hello ', 'Hello *world*!', 'Hello '.length, 'Hello ');

            expect(italicSlice.bodyMarkdown).toBe('Hello *w*');
            expect(italicSlice.sourceMarkdown).toBe('Hello *w');
            expect(stripIncompleteMarkdown(italicSlice.bodyMarkdown)).toBe('Hello _w_');
        });

        it('keeps temporary italic markup valid when the visible content ends in whitespace', () => {
            const spaceSlice = getNextVisibleStreamedReplyMarkdown('Hello *QuickBooks*', 'Hello *QuickBooks Online*', 'Hello *QuickBooks'.length, 'Hello *QuickBooks');

            expect(spaceSlice.bodyMarkdown).toBe('Hello *QuickBooks* ');
            expect(spaceSlice.sourceMarkdown).toBe('Hello *QuickBooks ');
            expect(stripIncompleteMarkdown(spaceSlice.bodyMarkdown)).toBe('Hello _QuickBooks_ ');
        });

        it('streams complete links by linked text without exposing the destination URL as plain text', () => {
            const linkSlice = getNextVisibleStreamedReplyMarkdown('See ', 'See [docs](https://example.com)', 'See '.length, 'See ');

            expect(linkSlice.bodyMarkdown).toBe('See [d](https://example.com)');
            expect(linkSlice.sourceMarkdown).toBe('See [d');
        });

        it('does not consume hidden source text while markdown is still incomplete', () => {
            const boldSlice = getNextVisibleStreamedReplyMarkdown('Hello ', 'Hello **world', 'Hello '.length, 'Hello ');
            const italicSlice = getNextVisibleStreamedReplyMarkdown('Hello ', 'Hello *world', 'Hello '.length, 'Hello ');
            const linkSlice = getNextVisibleStreamedReplyMarkdown('See ', 'See [docs](https://example', 'See '.length, 'See ');

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
            const nextSlice = getNextVisibleStreamedReplyMarkdown('Hello ', targetWithCompletedBold, 'Hello '.length, 'Hello ');

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
            const reply = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: 'Hello **bold**!'}), REPORT_ID, false);

            expect(getFirstMessageHTML(reply)).toContain('<strong>bold</strong>');
            expect(getFirstMessageHTML(reply)).not.toContain('*');
        });

        it('keeps complete single-delimiter italic styled without rendering it as bold during streaming', () => {
            const reply = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: 'Hello *italic*!'}), REPORT_ID, false);

            expect(getFirstMessageHTML(reply)).toContain('<em>italic</em>');
            expect(getFirstMessageHTML(reply)).not.toContain('<strong>italic</strong>');
            expect(getFirstMessageHTML(reply)).not.toContain('*');
        });

        it('strips incomplete markdown during a streaming draft event', () => {
            const reply = applyStreamedReplyEvent(null, createDraftEvent({bodyMarkdown: 'Check [this link'}), REPORT_ID, false);
            // The raw '[this link' syntax should NOT appear in the rendered HTML
            expect(getFirstMessageHTML(reply)).not.toContain('[this link');
        });
    });

    describe('draftCache', () => {
        // Always start clean so tests don't leak state into each other.
        beforeEach(() => {
            setCachedReply(REPORT_ID, null);
        });

        it('returns null for an unseen reportID', () => {
            expect(getCachedReply('never-stored')).toBeNull();
        });

        it('persists a draft across set/get and survives across calls (the remount survival contract)', () => {
            const reply = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);
            expect(reply).not.toBeNull();
            setCachedReply(REPORT_ID, reply);
            expect(getCachedReply(REPORT_ID)).toBe(reply);
            // Simulating a remount: a fresh getCachedReply call returns the same instance.
            expect(getCachedReply(REPORT_ID)).toBe(reply);
        });

        it('evicts when set to null (completed/failed/cleared reducer return)', () => {
            const reply = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);
            setCachedReply(REPORT_ID, reply);
            expect(getCachedReply(REPORT_ID)).not.toBeNull();
            setCachedReply(REPORT_ID, null);
            expect(getCachedReply(REPORT_ID)).toBeNull();
        });

        it('keeps entries scoped per reportID (no cross-talk)', () => {
            const draftA = applyStreamedReplyEvent(null, createDraftEvent(), REPORT_ID, false);
            const draftB = applyStreamedReplyEvent(null, createDraftEvent({reportID: 'other'}), 'other', false);
            setCachedReply(REPORT_ID, draftA);
            setCachedReply('other', draftB);
            expect(getCachedReply(REPORT_ID)).toBe(draftA);
            expect(getCachedReply('other')).toBe(draftB);
        });
    });
});
