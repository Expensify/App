// cspell:ignore dani
import tokenizeForReveal from '@libs/ReportActionFollowupUtils/tokenizeForReveal';

describe('tokenizeForReveal', () => {
    it('returns just the empty stage for an empty input', () => {
        expect(tokenizeForReveal('')).toEqual(['']);
    });

    it('reveals plain text character-by-character inside a single block', () => {
        const html = '<p>The quick brown fox.</p>';
        const stages = tokenizeForReveal(html);

        expect(stages.at(0)).toBe('');
        expect(stages.at(-1)).toBe('<p>The quick brown fox.</p>');
        // Char-level reveal yields one stage per character of the text content
        // ("The quick brown fox." = 20 chars), plus stage 0 (empty).
        expect(stages.length).toBe(21);
    });

    it('preserves the <strong> wrapper while revealing words inside it (formatting applies as text grows)', () => {
        const html = '<p>Status: <strong>important warning</strong> for you.</p>';
        const stages = tokenizeForReveal(html);

        // At some intermediate stage we should see the bold wrapper opened
        // around a partial word — proves we're recursing into the formatting
        // element rather than treating it as atomic.
        const hasOpenStrong = stages.some((s) => /<strong>[^<]*<\/strong>/.test(s) && !s.includes('important warning'));
        expect(hasOpenStrong).toBe(true);

        // Every stage must keep the <strong> tag balanced.
        for (const stage of stages) {
            const opens = (stage.match(/<strong>/g) ?? []).length;
            const closes = (stage.match(/<\/strong>/g) ?? []).length;
            expect(opens).toBe(closes);
        }

        expect(stages.at(-1)).toBe('<p>Status: <strong>important warning</strong> for you.</p>');
    });

    it('keeps mention-user atomic (never half-rendered)', () => {
        const html = '<p>Hi <mention-user accountID="42">@daniel</mention-user> welcome.</p>';
        const stages = tokenizeForReveal(html);

        for (const stage of stages) {
            const opens = (stage.match(/<mention-user/g) ?? []).length;
            const closes = (stage.match(/<\/mention-user>/g) ?? []).length;
            expect(opens).toBe(closes);
        }

        // Partial text inside the mention-user wrapper would indicate broken atomicity.
        expect(stages.some((s) => /<mention-user[^>]*>@dani(?!e)/.test(s))).toBe(false);
    });

    it('keeps emoji atomic', () => {
        const html = '<p>Status: <emoji>✅</emoji> all good.</p>';
        const stages = tokenizeForReveal(html);

        for (const stage of stages) {
            const opens = (stage.match(/<emoji>/g) ?? []).length;
            const closes = (stage.match(/<\/emoji>/g) ?? []).length;
            expect(opens).toBe(closes);
        }
    });

    it('keeps anchor atomic so the URL and text appear together', () => {
        const html = '<p>See <a href="https://example.com">our docs</a> for more.</p>';
        const stages = tokenizeForReveal(html);

        const anchorContents = stages.flatMap((s) => Array.from(s.matchAll(/<a[^>]*>([^<]*)<\/a>/g)).map((m) => m[1]));
        for (const content of anchorContents) {
            expect(content).toBe('our docs');
        }
    });

    it('keeps code atomic', () => {
        const html = '<p>Run <code>npm install</code> to start.</p>';
        const stages = tokenizeForReveal(html);

        const codeContents = stages.flatMap((s) => Array.from(s.matchAll(/<code>([^<]*)<\/code>/g)).map((m) => m[1]));
        for (const content of codeContents) {
            expect(content).toBe('npm install');
        }
    });

    it('reveals each top-level child progressively (multi-paragraph + list shape)', () => {
        const html = '<p>Intro paragraph here.</p><ol><li>First step.</li><li>Second step.</li></ol><p>Closing line.</p>';
        const stages = tokenizeForReveal(html);

        expect(stages.at(-1)).toBe(html);

        // Stages must monotonically grow: textual content length never decreases.
        const lengths = stages.map((s) => s.replaceAll(/<[^>]+>/g, '').length);
        for (let i = 1; i < lengths.length; i++) {
            expect(lengths.at(i) ?? 0).toBeGreaterThanOrEqual(lengths.at(i - 1) ?? 0);
        }
    });

    it('produces enough anchors that a typical multi-paragraph response trickles smoothly', () => {
        // Realistic shape — Xero-style 5-step instructions.
        const html =
            '<p>Here is how to connect Xero as your accounting integration:</p><ol><li>In the left-hand menu, go to Settings.</li><li>Click More features, then click Accounting.</li><li>Click Set up next to Xero.</li><li>Log in to Xero as an administrator.</li><li>Confirm the connection.</li></ol><p>This imports your charts of accounts and tracking categories.</p>';
        const stages = tokenizeForReveal(html);
        // Char-level: total visible-text chars ~280, so we expect comfortably
        // more than the shouldTrickle threshold of 100 anchors.
        expect(stages.length).toBeGreaterThanOrEqual(200);
    });
});
