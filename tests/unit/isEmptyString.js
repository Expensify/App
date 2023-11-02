import _ from 'underscore';
import enEmojis from '../../assets/emojis/en';
import isEmpty from '../../src/libs/isEmptyString';

describe('libs/isEmpty', () => {
    it('basic tests', () => {
        expect(isEmpty('test')).toBe(false);
        expect(isEmpty('test test')).toBe(false);
        expect(isEmpty('test test test')).toBe(false);
        expect(isEmpty(' ')).toBe(true);
    });
    it('trim spaces', () => {
        expect(isEmpty(' test')).toBe(false);
        expect(isEmpty('test ')).toBe(false);
        expect(isEmpty(' test ')).toBe(false);
    });
    it('remove invisible characters', () => {
        expect(isEmpty('\u200B')).toBe(true);
        expect(isEmpty('\u200B')).toBe(true);
        expect(isEmpty('\u200B ')).toBe(true);
        expect(isEmpty('\u200B \u200B')).toBe(true);
        expect(isEmpty('\u200B \u200B ')).toBe(true);
    });
    it('remove invisible characters (Cc)', () => {
        expect(isEmpty('\u0000')).toBe(true);
        expect(isEmpty('\u0001')).toBe(true);
        expect(isEmpty('\u0009')).toBe(true);
    });
    it('remove invisible characters (Cf)', () => {
        expect(isEmpty('\u200E')).toBe(true);
        expect(isEmpty('\u200F')).toBe(true);
        expect(isEmpty('\u2060')).toBe(true);
    });
    it('remove invisible characters (Cs)', () => {
        expect(isEmpty('\uD800')).toBe(true);
        expect(isEmpty('\uD801')).toBe(true);
        expect(isEmpty('\uD802')).toBe(true);
    });
    it('remove invisible characters (Co)', () => {
        expect(isEmpty('\uE000')).toBe(true);
        expect(isEmpty('\uE001')).toBe(true);
        expect(isEmpty('\uE002')).toBe(true);
    });
    it('remove invisible characters (Zl)', () => {
        expect(isEmpty('\u2028')).toBe(true);
        expect(isEmpty('\u2029')).toBe(true);
        expect(isEmpty('\u202A')).toBe(true);
    });
    it('basic check emojis not removed', () => {
        expect(isEmpty('😀')).toBe(false);
    });
    it('all emojis not removed', () => {
        _.keys(enEmojis).forEach((key) => {
            expect(isEmpty(key)).toBe(false);
        });
    });
    it('remove invisible characters (editpad)', () => {
        expect(isEmpty('\u0020')).toBe(true);
        expect(isEmpty('\u00A0')).toBe(true);
        expect(isEmpty('\u2000')).toBe(true);
        expect(isEmpty('\u2001')).toBe(true);
        expect(isEmpty('\u2002')).toBe(true);
        expect(isEmpty('\u2003')).toBe(true);
        expect(isEmpty('\u2004')).toBe(true);
        expect(isEmpty('\u2005')).toBe(true);
        expect(isEmpty('\u2006')).toBe(true);
        expect(isEmpty('\u2007')).toBe(true);
        expect(isEmpty('\u2008')).toBe(true);
        expect(isEmpty('\u2009')).toBe(true);
        expect(isEmpty('\u200A')).toBe(true);
        expect(isEmpty('\u2028')).toBe(true);
        expect(isEmpty('\u205F')).toBe(true);
        expect(isEmpty('\u3000')).toBe(true);
        expect(isEmpty(' ')).toBe(true);
    });
    it('other tests', () => {
        expect(isEmpty('\u200D')).toBe(true);
        expect(isEmpty('\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F')).toBe(false);
        expect(isEmpty('\uD83C')).toBe(true);
        expect(isEmpty('\uDFF4')).toBe(true);
        expect(isEmpty('\uDB40')).toBe(true);
        expect(isEmpty('\uDC67')).toBe(true);
        expect(isEmpty('\uDC62')).toBe(true);
        expect(isEmpty('\uDC65')).toBe(true);
        expect(isEmpty('\uDC6E')).toBe(true);
        expect(isEmpty('\uDC67')).toBe(true);
        expect(isEmpty('\uDC7F')).toBe(true);

        // A special test, an invisible character from other Unicode categories than format and control
        expect(isEmpty('\u3164')).toBe(true);
    });
});
