import enEmojis from '@assets/emojis/en';
import StringUtils from '@src/libs/StringUtils';

describe('libs/StringUtils.removeInvisibleCharacters', () => {
    it('basic tests', () => {
        expect(StringUtils.removeInvisibleCharacters('test')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test test')).toBe('test test');
        expect(StringUtils.removeInvisibleCharacters('abcdefghijklmnopqrstuvwxyz')).toBe('abcdefghijklmnopqrstuvwxyz');
        expect(StringUtils.removeInvisibleCharacters('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        expect(StringUtils.removeInvisibleCharacters('0123456789')).toBe('0123456789');
        expect(StringUtils.removeInvisibleCharacters('!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~')).toBe('!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~');
        expect(StringUtils.removeInvisibleCharacters('')).toBe('');
        expect(StringUtils.removeInvisibleCharacters(' ')).toBe('');
    });
    it('other alphabets, list of all characters', () => {
        // arabic
        expect(StringUtils.removeInvisibleCharacters('أبجدية عربية')).toBe('أبجدية عربية');
        // chinese
        expect(StringUtils.removeInvisibleCharacters('的一是了我不人在他们')).toBe('的一是了我不人在他们');
        // cyrillic
        expect(StringUtils.removeInvisibleCharacters('абвгдезиклмнопр')).toBe('абвгдезиклмнопр');
        // greek
        expect(StringUtils.removeInvisibleCharacters('αβγδεζηθικλμνξοπρ')).toBe('αβγδεζηθικλμνξοπρ');
        // hebrew
        expect(StringUtils.removeInvisibleCharacters('אבגדהוזחטיכלמנ')).toBe('אבגדהוזחטיכלמנ');
        // hindi
        expect(StringUtils.removeInvisibleCharacters('अआइईउऊऋऍऎ')).toBe('अआइईउऊऋऍऎ');
        // japanese
        expect(StringUtils.removeInvisibleCharacters('あいうえおかきくけこ')).toBe('あいうえおかきくけこ');
        // korean
        expect(StringUtils.removeInvisibleCharacters('가나다라마바사아자')).toBe('가나다라마바사아자');
        // thai
        expect(StringUtils.removeInvisibleCharacters('กขคงจฉชซ')).toBe('กขคงจฉชซ');
    });
    it('trim spaces', () => {
        expect(StringUtils.removeInvisibleCharacters(' test')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test ')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters(' test ')).toBe('test');
    });
    it('remove invisible characters', () => {
        expect(StringUtils.removeInvisibleCharacters('test\u200B')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u200Btest')).toBe('testtest');
        expect(StringUtils.removeInvisibleCharacters('test\u200B test')).toBe('test test');
        expect(StringUtils.removeInvisibleCharacters('test\u200B test\u200B')).toBe('test test');
        expect(StringUtils.removeInvisibleCharacters('test\u200B test\u200B test')).toBe('test test test');
    });
    it('remove invisible characters (Cc)', () => {
        expect(StringUtils.removeInvisibleCharacters('test\u0000')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u0001')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u0009')).toBe('test');
    });
    it('remove invisible characters (Cf)', () => {
        expect(StringUtils.removeInvisibleCharacters('test\u200E')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u200F')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2060')).toBe('test');
    });
    it('check other visible characters (Cs)', () => {
        expect(StringUtils.removeInvisibleCharacters('test\uD800')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\uD801')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\uD802')).toBe('test');
    });
    it('check other visible characters (Co)', () => {
        expect(StringUtils.removeInvisibleCharacters('test\uE000')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\uE001')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\uE002')).toBe('test');
    });
    it('remove invisible characters (Cn)', () => {
        expect(StringUtils.removeInvisibleCharacters('test\uFFF0')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\uFFF1')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\uFFF2')).toBe('test');
    });
    it('remove invisible characters (Zl)', () => {
        expect(StringUtils.removeInvisibleCharacters('test\u2028')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2029')).toBe('test');
    });
    it('basic check emojis not removed', () => {
        expect(StringUtils.removeInvisibleCharacters('test😀')).toBe('test😀');
        expect(StringUtils.removeInvisibleCharacters('test😀😀')).toBe('test😀😀');
        expect(StringUtils.removeInvisibleCharacters('test😀😀😀')).toBe('test😀😀😀');
    });
    it('all emojis not removed', () => {
        for (const key of Object.keys(enEmojis)) {
            expect(StringUtils.removeInvisibleCharacters(key)).toBe(key);
        }
    });
    it('remove invisible characters (editpad)', () => {
        expect(StringUtils.removeInvisibleCharacters('test\u0020')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u00A0')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2000')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2001')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2002')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2003')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2004')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2005')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2006')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2007')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2008')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2009')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u200A')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u2028')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u205F')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test\u3000')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test ')).toBe('test');
    });
    it('other tests', () => {
        expect(StringUtils.removeInvisibleCharacters('\uD83D\uDE36\u200D\uD83C\uDF2B\uFE0F')).toBe('😶‍🌫️');
        expect(StringUtils.removeInvisibleCharacters('⁠test')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('test⁠test')).toBe('testtest');
        expect(StringUtils.removeInvisibleCharacters('  	 ‎ ‏ ⁠        　 ')).toBe('');
        expect(StringUtils.removeInvisibleCharacters('te	‎‏⁠st')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F')).toBe('🏴󠁧󠁢󠁥󠁮󠁧󠁿');
    });
    it('special scenarios', () => {
        // Normally we do not remove this character, because it is used in Emojis.
        // But if the String consist of only invisible characters, we can safely remove it.
        expect(StringUtils.removeInvisibleCharacters('\u200D')).toBe('');
        expect(StringUtils.removeInvisibleCharacters('⁠')).toBe('');
    });
    it('check multiline', () => {
        expect(StringUtils.removeInvisibleCharacters('test\ntest')).toBe('test\ntest');
        expect(StringUtils.removeInvisibleCharacters('test\n')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('\ntest')).toBe('test');
        expect(StringUtils.removeInvisibleCharacters('\n')).toBe('');
        expect(StringUtils.removeInvisibleCharacters('\n\n')).toBe('');
        expect(StringUtils.removeInvisibleCharacters('\n\n\n')).toBe('');

        // multiple newlines
        expect(StringUtils.removeInvisibleCharacters('test\n\ntest')).toBe('test\n\ntest');
        expect(StringUtils.removeInvisibleCharacters('test\n\n\ntest')).toBe('test\n\n\ntest');
        expect(StringUtils.removeInvisibleCharacters('test\n\n\n\ntest')).toBe('test\n\n\n\ntest');

        // multiple newlinest with multiple texts
        expect(StringUtils.removeInvisibleCharacters('test\ntest\ntest')).toBe('test\ntest\ntest');
        expect(StringUtils.removeInvisibleCharacters('test\ntest\ntest\ntest')).toBe('test\ntest\ntest\ntest');
        expect(StringUtils.removeInvisibleCharacters('test\ntest\ntest\ntest\ntest')).toBe('test\ntest\ntest\ntest\ntest');

        // multiple newlines with multiple texts and spaces
        expect(StringUtils.removeInvisibleCharacters('test\n\ntest\ntest\ntest\ntest')).toBe('test\n\ntest\ntest\ntest\ntest');

        expect(StringUtils.removeInvisibleCharacters('test\n \ntest')).toBe('test\n \ntest');
    });
    it('check markdown styling', () => {
        expect(StringUtils.removeInvisibleCharacters('# test\n** test **')).toBe('# test\n** test **');
        expect(StringUtils.removeInvisibleCharacters('# test\n** test **\n')).toBe('# test\n** test **');
        expect(StringUtils.removeInvisibleCharacters('# test\n**test**\n~~test~~')).toBe('# test\n**test**\n~~test~~');

        // multiple newlines
        expect(StringUtils.removeInvisibleCharacters('# test\n\n** test **')).toBe('# test\n\n** test **');
        expect(StringUtils.removeInvisibleCharacters('# test\n\n** test **\n')).toBe('# test\n\n** test **');
    });
});
