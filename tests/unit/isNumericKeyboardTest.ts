import isNumericKeyboard from '@components/Form/isNumericKeyboard';
import CONST from '@src/CONST';

describe('isNumericKeyboard', () => {
    it('returns true for inputMode tel', () => {
        expect(isNumericKeyboard({inputMode: CONST.INPUT_MODE.TEL})).toBe(true);
    });

    it('returns true for inputMode numeric', () => {
        expect(isNumericKeyboard({inputMode: CONST.INPUT_MODE.NUMERIC})).toBe(true);
    });

    it('returns true for inputMode decimal', () => {
        expect(isNumericKeyboard({inputMode: CONST.INPUT_MODE.DECIMAL})).toBe(true);
    });

    it('returns true for keyboardType phone-pad', () => {
        expect(isNumericKeyboard({keyboardType: 'phone-pad'})).toBe(true);
    });

    it('returns true for keyboardType number-pad', () => {
        expect(isNumericKeyboard({keyboardType: 'number-pad'})).toBe(true);
    });

    it('returns true for keyboardType decimal-pad', () => {
        expect(isNumericKeyboard({keyboardType: 'decimal-pad'})).toBe(true);
    });

    it('returns false for inputMode text', () => {
        expect(isNumericKeyboard({inputMode: CONST.INPUT_MODE.TEXT})).toBe(false);
    });

    it('returns false for inputMode email', () => {
        expect(isNumericKeyboard({inputMode: CONST.INPUT_MODE.EMAIL})).toBe(false);
    });

    it('returns false for keyboardType ascii-capable', () => {
        expect(isNumericKeyboard({keyboardType: 'ascii-capable'})).toBe(false);
    });

    it('returns false for empty props', () => {
        expect(isNumericKeyboard({})).toBe(false);
    });

    it('returns false when neither inputMode nor keyboardType is set', () => {
        expect(isNumericKeyboard({placeholder: 'Enter value'})).toBe(false);
    });

    it('returns true when inputMode is numeric even if keyboardType is non-numeric', () => {
        expect(isNumericKeyboard({inputMode: CONST.INPUT_MODE.NUMERIC, keyboardType: 'default'})).toBe(true);
    });

    it('returns true when keyboardType is phone-pad even if inputMode is text', () => {
        expect(isNumericKeyboard({inputMode: CONST.INPUT_MODE.TEXT, keyboardType: 'phone-pad'})).toBe(true);
    });
});
