import hydrateEmojiHtml from '@libs/hydrateEmojiHtml';

describe('hydrateEmojiHtml', () => {
    it('returns empty string when input is empty', () => {
        expect(hydrateEmojiHtml('')).toBe('');
    });

    it('returns input unchanged when there are no emoji tags', () => {
        const html = '<p>Hello world</p>';
        expect(hydrateEmojiHtml(html)).toBe(html);
    });

    it('adds ismedium to raw <emoji> tags', () => {
        const html = 'Hello <emoji>😀</emoji> world';
        expect(hydrateEmojiHtml(html)).toBe('Hello <emoji ismedium>😀</emoji> world');
    });

    it('adds ismedium to multiple raw emoji tags', () => {
        const html = '<emoji>😀</emoji> and <emoji>👍</emoji>';
        expect(hydrateEmojiHtml(html)).toBe('<emoji ismedium>😀</emoji> and <emoji ismedium>👍</emoji>');
    });

    it('adds oneline when emoji is on its own line at start of string', () => {
        const html = '<emoji>😀</emoji>';
        expect(hydrateEmojiHtml(html)).toBe('<emoji oneline ismedium>😀</emoji>');
    });

    it('adds oneline when emoji is on its own line after <br>', () => {
        const html = 'Hello<br /><emoji>😀</emoji><br />world';
        expect(hydrateEmojiHtml(html)).toBe('Hello<br /><emoji oneline ismedium>😀</emoji><br />world');
    });

    it('adds oneline when emoji is on its own line after closing block tag', () => {
        const html = '<p>Text</p><emoji>😀</emoji><p>More</p>';
        expect(hydrateEmojiHtml(html)).toBe('<p>Text</p><emoji oneline ismedium>😀</emoji><p>More</p>');
    });

    it('does not add oneline when emoji is inline with text', () => {
        const html = 'Hello <emoji>😀</emoji> world';
        expect(hydrateEmojiHtml(html)).toBe('Hello <emoji ismedium>😀</emoji> world');
    });

    it('does not add oneline twice when tag already has oneline', () => {
        const html = '<br /><emoji ismedium oneline>😀</emoji><br />';
        expect(hydrateEmojiHtml(html)).toBe('<br /><emoji ismedium oneline>😀</emoji><br />');
    });

    it('handles emoji with whitespace before boundary after', () => {
        const html = '<br />  <emoji>😀</emoji>  <br />';
        expect(hydrateEmojiHtml(html)).toBe('<br />  <emoji oneline ismedium>😀</emoji>  <br />');
    });

    it('handles multiple emojis on separate lines', () => {
        const html = '<emoji>😀</emoji><br /><emoji>👍</emoji>';
        expect(hydrateEmojiHtml(html)).toBe('<emoji oneline ismedium>😀</emoji><br /><emoji oneline ismedium>👍</emoji>');
    });

    it('adds oneline only for emoji on separate line, not for inline one', () => {
        const html = 'Prefix <emoji>👍</emoji><br /><emoji>😀</emoji><br />Suffix';
        expect(hydrateEmojiHtml(html)).toBe('Prefix <emoji ismedium>👍</emoji><br /><emoji oneline ismedium>😀</emoji><br />Suffix');
    });
});
