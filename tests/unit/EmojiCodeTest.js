import * as EmojiUtils from '../../src/libs/EmojiUtils';

describe('EmojiCode', () => {
    it('Test replacing emoji codes with emojis inside a text', () => {
        const text = 'Hi :smile:';
        const {newText, lastReplacedSelection} = EmojiUtils.replaceEmojis(text);
        expect(newText).toBe('Hi 😄');
        expect(lastReplacedSelection).toEqual({
            start: 3,
            end: 10,
            newEmojiEnd: 5,
        });
    });

    it('Test suggesting emojis when typing emojis prefix after colon', () => {
        const text = 'Hi :happy';
        expect(EmojiUtils.suggestEmojis(text)).toEqual([{code: '🙋', name: 'raising_hand'}]);
    });

    it('Test suggest a limited number of matching emojis', () => {
        const text = 'Hi :face';
        const limit = 7;
        expect(EmojiUtils.suggestEmojis(text, limit).length).toBe(limit);
    });
});
