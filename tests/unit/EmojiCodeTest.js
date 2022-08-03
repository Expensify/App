import * as EmojiUtils from '../../src/libs/EmojiUtils';

describe('EmojiCode', () => {
    it('Test replacing emoji codes with emojis inside a text', () => {
        const text = 'Hi :smile:';
        expect(EmojiUtils.replaceEmojis(text)).toBe('Hi 😄');
    });
});
