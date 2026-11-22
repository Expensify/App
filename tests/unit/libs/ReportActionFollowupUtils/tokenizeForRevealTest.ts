// cspell:ignore dani
import tokenizeForReveal, {findRevealStage} from '@libs/ReportActionFollowupUtils/tokenizeForReveal';

import {isTag} from 'domhandler';
import {parseDocument} from 'htmlparser2';

/** Tag names of the chart element's direct element children, as a renderer walking the tree would see them. */
function getChartChildTags(html: string): string[] {
    const chart = parseDocument(html, {recognizeSelfClosing: true}).children.find(isTag);

    return (chart?.children ?? []).filter(isTag).map((child) => child.tagName);
}

/** Every stage of the reveal, so a test can compare or scan all of them. */
function getAllStages(html: string): string[] {
    const stages = tokenizeForReveal(html);
    return Array.from({length: stages.length}, (_, index) => stages.at(index) ?? '');
}

describe('tokenizeForReveal', () => {
    it('returns just the empty stage for an empty input', () => {
        expect(getAllStages('')).toEqual(['']);
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
        const stages = getAllStages(html);

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
        const stages = getAllStages(html);

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
        const stages = getAllStages(html);

        for (const stage of stages) {
            const opens = (stage.match(/<emoji>/g) ?? []).length;
            const closes = (stage.match(/<\/emoji>/g) ?? []).length;
            expect(opens).toBe(closes);
        }
    });

    it('keeps anchor atomic so the URL and text appear together', () => {
        const html = '<p>See <a href="https://example.com">our docs</a> for more.</p>';
        const stages = getAllStages(html);

        const anchorContents = stages.flatMap((s) => Array.from(s.matchAll(/<a[^>]*>([^<]*)<\/a>/g)).map((m) => m[1]));
        for (const content of anchorContents) {
            expect(content).toBe('our docs');
        }
    });

    it('keeps code atomic', () => {
        const html = '<p>Run <code>npm install</code> to start.</p>';
        const stages = getAllStages(html);

        const codeContents = stages.flatMap((s) => Array.from(s.matchAll(/<code>([^<]*)<\/code>/g)).map((m) => m[1]));
        for (const content of codeContents) {
            expect(content).toBe('npm install');
        }
    });

    it('reveals each top-level child progressively (multi-paragraph + list shape)', () => {
        const html = '<p>Intro paragraph here.</p><ol><li>First step.</li><li>Second step.</li></ol><p>Closing line.</p>';
        const stages = getAllStages(html);

        expect(stages.at(-1)).toBe(html);

        // Stages must monotonically grow: textual content length never decreases.
        const lengths = stages.map((s) => s.replaceAll(/<[^>]+>/g, '').length);
        for (let i = 1; i < lengths.length; i++) {
            expect(lengths.at(i) ?? 0).toBeGreaterThanOrEqual(lengths.at(i - 1) ?? 0);
        }
    });

    it('keeps self-closing chart tags as siblings rather than nesting them', () => {
        const html =
            '<victorychart width="680"><victoryaxis style="{axis: {stroke: \'transparent\'}}" /><victorypie data="[{x: \'Equipment\', y: 40}]" /><victorylabel text="Total" /></victorychart>';
        const stages = tokenizeForReveal(html);

        expect(getChartChildTags(html)).toEqual(['victoryaxis', 'victorypie', 'victorylabel']);
        expect(getChartChildTags(stages.at(-1) ?? '')).toEqual(['victoryaxis', 'victorypie', 'victorylabel']);
    });

    it('leaves escaped markup escaped instead of turning it into live markup', () => {
        const html = '<p>Type &lt;strong&gt;bold&lt;/strong&gt; to embolden, Jack &amp; Jill.</p>';

        expect(tokenizeForReveal(html).at(-1)).toBe(html);
    });

    it('preserves raw text escaping inside noscript at every reveal stage', () => {
        // Given text whose ampersand must stay unescaped under its raw text parent.
        const html = '<noscript>a&amp;b</noscript>';

        // When the text is progressively clipped, each clone still needs that parent context.
        const stages = getAllStages(html);

        // Then no intermediate stage introduces entity escaping that changes the existing output.
        expect(stages).toEqual(['', '<noscript>a</noscript>', '<noscript>a&</noscript>', '<noscript>a&b</noscript>']);
    });

    it('preserves HTML serialization inside a MathML integration point at every reveal stage', () => {
        // Given an HTML child whose empty attribute serializes differently in MathML.
        const html = '<math><mi><span title="">ab</span></mi></math>';

        // When the child is progressively clipped, its parent must still switch serialization back to HTML.
        const stages = getAllStages(html);

        // Then both partial and complete stages retain the existing HTML attribute serialization.
        expect(stages).toEqual(['', '<math><mi><span title>a</span></mi></math>', '<math><mi><span title>ab</span></mi></math>']);
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

    it('builds each stage only when it is asked for, with the same HTML a full scan gives', () => {
        // Given a paragraph with plain and bold text
        const stages = tokenizeForReveal('<p>ab <strong>cd</strong></p>');

        // When stages are read out of order and past the end
        const lastStage = stages.at(-1);
        const firstStage = stages.at(1);

        // Then each one is the HTML up to its character, like an array of every stage
        expect(stages.length).toBe(6);
        expect(lastStage).toBe('<p>ab <strong>cd</strong></p>');
        expect(firstStage).toBe('<p>a</p>');
        expect(stages.at(4)).toBe('<p>ab <strong>c</strong></p>');
        expect(stages.at(6)).toBeUndefined();
        expect(stages.at(-7)).toBeUndefined();
    });

    it('finds the stage that matches HTML already on screen', () => {
        // Given a reply with formatting, a mention, a link and a list
        const html = '<p>Hi <mention-user accountID="42">@daniel</mention-user>, see <a href="https://example.com">our docs</a>.</p><ul><li><strong>Submit</strong> &amp; approve</li></ul>';
        const stages = tokenizeForReveal(html);

        // When the HTML on screen is any one of its stages
        const foundStages = Array.from({length: stages.length}, (_, index) => findRevealStage(stages, stages.at(index) ?? ''));

        // Then the reveal continues from that stage, and HTML that is no stage starts it over
        expect(foundStages).toEqual(Array.from({length: stages.length}, (_, index) => index));
        expect(findRevealStage(stages, '<p>Hello</p>')).toBe(-1);
    });

    it('finds the stage of raw text that reads back as fewer characters', () => {
        // Given noscript text that is written back unescaped, so `&lt;` reads back as one character
        const html = '<p>a</p><noscript>&amp;lt;</noscript>';
        const stages = tokenizeForReveal(html);

        // When the HTML on screen is any one of its stages
        const foundStages = Array.from({length: stages.length}, (_, index) => findRevealStage(stages, stages.at(index) ?? ''));

        // Then the reveal still continues from that stage instead of starting over
        expect(stages.at(5)).toBe('<p>a</p><noscript>&lt;</noscript>');
        expect(foundStages).toEqual(Array.from({length: stages.length}, (_, index) => index));
    });

    it('makes every stage longer than the one before it, so a stage can be found by its length', () => {
        // Given replies with raw text, escaped markup, atomic tags and empty elements
        const replies = [
            '<p>a</p><noscript>x&amp;lt;y&amp;amp;</noscript><p>b <strong>c</strong></p>',
            '<p>Type &lt;strong&gt;bold&lt;/strong&gt;, Jack &amp; Jill.</p><br/><p></p>',
            '<p>Hi <mention-user accountID="42">@daniel</mention-user> <emoji>✅</emoji> <a href="https://example.com">docs</a> <code>npm</code></p>',
        ];

        for (const reply of replies) {
            // When every stage is built
            const lengths = getAllStages(reply).map((stage) => stage.length);

            // Then each one is longer than the stage before it
            expect(lengths.slice(1).every((length, index) => length > (lengths.at(index) ?? 0))).toBe(true);
        }
    });
});
