import enEmojis from '@assets/emojis/en';
import StringUtils from '@libs/StringUtils';

describe('libs/StringUtils.isEmptyString', () => {
    it('basic tests', () => {
        expect(StringUtils.isEmptyString('test')).toBe(false);
        expect(StringUtils.isEmptyString('test test')).toBe(false);
        expect(StringUtils.isEmptyString('test test test')).toBe(false);
        expect(StringUtils.isEmptyString(' ')).toBe(true);
    });
    it('trim spaces', () => {
        expect(StringUtils.isEmptyString(' test')).toBe(false);
        expect(StringUtils.isEmptyString('test ')).toBe(false);
        expect(StringUtils.isEmptyString(' test ')).toBe(false);
    });
    it('remove invisible characters', () => {
        expect(StringUtils.isEmptyString('\u200B')).toBe(true);
        expect(StringUtils.isEmptyString('\u200B')).toBe(true);
        expect(StringUtils.isEmptyString('\u200B ')).toBe(true);
        expect(StringUtils.isEmptyString('\u200B \u200B')).toBe(true);
        expect(StringUtils.isEmptyString('\u200B \u200B ')).toBe(true);
    });
    it('remove invisible characters (Cc)', () => {
        expect(StringUtils.isEmptyString('\u0000')).toBe(true);
        expect(StringUtils.isEmptyString('\u0001')).toBe(true);
        expect(StringUtils.isEmptyString('\u0009')).toBe(true);
    });
    it('remove invisible characters (Cf)', () => {
        expect(StringUtils.isEmptyString('\u200E')).toBe(true);
        expect(StringUtils.isEmptyString('\u200F')).toBe(true);
        expect(StringUtils.isEmptyString('\u2060')).toBe(true);
    });
    it('remove invisible characters (Cs)', () => {
        expect(StringUtils.isEmptyString('\uD800')).toBe(true);
        expect(StringUtils.isEmptyString('\uD801')).toBe(true);
        expect(StringUtils.isEmptyString('\uD802')).toBe(true);
    });
    it('remove invisible characters (Co)', () => {
        expect(StringUtils.isEmptyString('\uE000')).toBe(true);
        expect(StringUtils.isEmptyString('\uE001')).toBe(true);
        expect(StringUtils.isEmptyString('\uE002')).toBe(true);
    });
    it('remove invisible characters (Zl)', () => {
        expect(StringUtils.isEmptyString('\u2028')).toBe(true);
        expect(StringUtils.isEmptyString('\u2029')).toBe(true);
        expect(StringUtils.isEmptyString('\u202A')).toBe(true);
    });
    it('basic check emojis not removed', () => {
        expect(StringUtils.isEmptyString('😀')).toBe(false);
    });
    it('all emojis not removed', () => {
        for (const key of Object.keys(enEmojis)) {
            expect(StringUtils.isEmptyString(key)).toBe(false);
        }
    });
    it('remove invisible characters (edit pad)', () => {
        expect(StringUtils.isEmptyString('\u0020')).toBe(true);
        expect(StringUtils.isEmptyString('\u00A0')).toBe(true);
        expect(StringUtils.isEmptyString('\u2000')).toBe(true);
        expect(StringUtils.isEmptyString('\u2001')).toBe(true);
        expect(StringUtils.isEmptyString('\u2002')).toBe(true);
        expect(StringUtils.isEmptyString('\u2003')).toBe(true);
        expect(StringUtils.isEmptyString('\u2004')).toBe(true);
        expect(StringUtils.isEmptyString('\u2005')).toBe(true);
        expect(StringUtils.isEmptyString('\u2006')).toBe(true);
        expect(StringUtils.isEmptyString('\u2007')).toBe(true);
        expect(StringUtils.isEmptyString('\u2008')).toBe(true);
        expect(StringUtils.isEmptyString('\u2009')).toBe(true);
        expect(StringUtils.isEmptyString('\u200A')).toBe(true);
        expect(StringUtils.isEmptyString('\u2028')).toBe(true);
        expect(StringUtils.isEmptyString('\u205F')).toBe(true);
        expect(StringUtils.isEmptyString('\u3000')).toBe(true);
        expect(StringUtils.isEmptyString(' ')).toBe(true);
    });
    it('other tests', () => {
        expect(StringUtils.isEmptyString('\u200D')).toBe(true);
        expect(StringUtils.isEmptyString('\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F')).toBe(false);
        expect(StringUtils.isEmptyString('\uD83C')).toBe(true);
        expect(StringUtils.isEmptyString('\uDFF4')).toBe(true);
        expect(StringUtils.isEmptyString('\uDB40')).toBe(true);
        expect(StringUtils.isEmptyString('\uDC67')).toBe(true);
        expect(StringUtils.isEmptyString('\uDC62')).toBe(true);
        expect(StringUtils.isEmptyString('\uDC65')).toBe(true);
        expect(StringUtils.isEmptyString('\uDC6E')).toBe(true);
        expect(StringUtils.isEmptyString('\uDC67')).toBe(true);
        expect(StringUtils.isEmptyString('\uDC7F')).toBe(true);

        // A special test, an invisible character from other Unicode categories than format and control
        expect(StringUtils.isEmptyString('\u3164')).toBe(true);
    });
});
