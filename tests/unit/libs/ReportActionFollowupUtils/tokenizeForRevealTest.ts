import tokenizeForReveal from '@libs/ReportActionFollowupUtils/tokenizeForReveal';

describe('tokenizeForReveal', () => {
    it('returns just the empty stage for an empty input', () => {
        expect(tokenizeForReveal('')).toEqual(['']);
    });

    it('returns one content stage for single top-level child (binary reveal fallback)', () => {
        const html = '<p>Just one paragraph.</p>';
        const stages = tokenizeForReveal(html);

        // [empty, full]. The hook treats this as a binary reveal because length < 3.
        expect(stages).toHaveLength(2);
        expect(stages.at(0)).toBe('');
        expect(stages.at(-1)).toBe(html);
    });

    it('produces progressive prefixes split at top-level boundaries', () => {
        const html = '<p>First.</p><p>Second.</p><ul><li>Third.</li></ul>';
        const stages = tokenizeForReveal(html);

        expect(stages).toEqual(['', '<p>First.</p>', '<p>First.</p><p>Second.</p>', html]);
    });

    it('keeps inline atomics whole (mention, emoji, anchor, code stay intact in their parent)', () => {
        // Each top-level <p> is an atomic unit so its inline children never render half-parsed.
        // htmlparser2's parseDocument lowercases attribute names — that matches the rest of the
        // codebase (see parseFollowupsFromHtml) so we accept it as the canonical shape.
        const html = '<p>Hi <mention-user accountID="42">@daniel</mention-user></p><p>Status: <emoji>✅</emoji></p>';
        const stages = tokenizeForReveal(html);

        expect(stages.at(1)).toContain('mention-user');
        expect(stages.at(1)).toContain('@daniel');
        // No stage shows a partially-rendered mention or emoji.
        for (const stage of stages) {
            const openMentions = (stage.match(/<mention-user/g) ?? []).length;
            const closeMentions = (stage.match(/<\/mention-user>/g) ?? []).length;
            expect(openMentions).toBe(closeMentions);

            const openEmojis = (stage.match(/<emoji>/g) ?? []).length;
            const closeEmojis = (stage.match(/<\/emoji>/g) ?? []).length;
            expect(openEmojis).toBe(closeEmojis);
        }
    });

    it('preserves the typical Concierge response shape (paragraphs + bullet list)', () => {
        const html = "<p>To set up QuickBooks, here's what to do:</p><ol><li>Go to Settings.</li><li>Click Connections.</li><li>Pick QBO.</li></ol><p>Let me know if you hit a snag.</p>";
        const stages = tokenizeForReveal(html);

        // 3 top-level children => 4 stages (empty + 3 progressive).
        expect(stages).toHaveLength(4);
        expect(stages.at(-1)).toBe(html);
    });
});
