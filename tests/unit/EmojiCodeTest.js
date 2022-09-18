import * as EmojiUtils from '../../src/libs/EmojiUtils';

describe('EmojiCode', () => {
    it('Test replacing emoji codes with emojis inside a text', () => {
        const text = 'Hi :smile:';
        expect(EmojiUtils.replaceEmojis(text)).toBe('Hi 😄');
    });

    it('Test suggesting emojis when typing emojis prefix after colon', () => {
        const text = 'Hi :happy';
        expect(EmojiUtils.suggestEmojis(text)).toEqual([{code: '🙋', name: 'raising_hand'}]);
    });
});
