// Import passthrough directly so Jest doesn't resolve the .ios variant for default tests
import hydrateEmojiHtmlIOS from '@libs/hydrateEmojiHtml/index.ios';

describe('hydrateEmojiHtml (iOS)', () => {
    it('returns empty string when input is empty', () => {
        expect(hydrateEmojiHtmlIOS('')).toBe('');
    });

    it('returns input unchanged when there are no emoji tags', () => {
        const html = '<p>Hello world</p>';
        expect(hydrateEmojiHtmlIOS(html)).toBe(html);
    });

    it('adds ismedium to raw <emoji> tags', () => {
        const html = 'Hello <emoji>😀</emoji> world';
        expect(hydrateEmojiHtmlIOS(html)).toBe('Hello <emoji ismedium>😀</emoji> world');
    });

    it('adds ismedium to multiple raw emoji tags', () => {
        const html = '<emoji>😀</emoji> and <emoji>👍</emoji>';
        expect(hydrateEmojiHtmlIOS(html)).toBe('<emoji ismedium>😀</emoji> and <emoji ismedium>👍</emoji>');
    });

    it('adds isOnSeparateLine when emoji is on its own line at start of string', () => {
        const html = '<emoji>😀</emoji>';
        expect(hydrateEmojiHtmlIOS(html)).toBe('<emoji isOnSeparateLine ismedium>😀</emoji>');
    });

    it('adds isOnSeparateLine when emoji is on its own line after <br>', () => {
        const html = 'Hello<br /><emoji>😀</emoji><br />world';
        expect(hydrateEmojiHtmlIOS(html)).toBe('Hello<br /><emoji isOnSeparateLine ismedium>😀</emoji><br />world');
    });

    it('adds isOnSeparateLine when emoji is on its own line after closing block tag', () => {
        const html = '<p>Text</p><emoji>😀</emoji><p>More</p>';
        expect(hydrateEmojiHtmlIOS(html)).toBe('<p>Text</p><emoji isOnSeparateLine ismedium>😀</emoji><p>More</p>');
    });

    it('does not add isOnSeparateLine when emoji is inline with text', () => {
        const html = 'Hello <emoji>😀</emoji> world';
        expect(hydrateEmojiHtmlIOS(html)).toBe('Hello <emoji ismedium>😀</emoji> world');
    });

    it('does not add isOnSeparateLine twice when tag already has isOnSeparateLine', () => {
        const html = '<br /><emoji ismedium isOnSeparateLine>😀</emoji><br />';
        expect(hydrateEmojiHtmlIOS(html)).toBe('<br /><emoji ismedium isOnSeparateLine>😀</emoji><br />');
    });

    it('handles emoji with whitespace before boundary after', () => {
        const html = '<br />  <emoji>😀</emoji>  <br />';
        expect(hydrateEmojiHtmlIOS(html)).toBe('<br />  <emoji isOnSeparateLine ismedium>😀</emoji>  <br />');
    });

    it('handles multiple emojis on separate lines', () => {
        const html = '<emoji>😀</emoji><br /><emoji>👍</emoji>';
        expect(hydrateEmojiHtmlIOS(html)).toBe('<emoji isOnSeparateLine ismedium>😀</emoji><br /><emoji isOnSeparateLine ismedium>👍</emoji>');
    });

    it('adds isOnSeparateLine only for emoji on separate line, not for inline one', () => {
        const html = 'Prefix <emoji>👍</emoji><br /><emoji>😀</emoji><br />Suffix';
        expect(hydrateEmojiHtmlIOS(html)).toBe('Prefix <emoji ismedium>👍</emoji><br /><emoji isOnSeparateLine ismedium>😀</emoji><br />Suffix');
    });
});
