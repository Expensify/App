const numConvert = require('../../src/libs/NumberCovert');

describe('numConvert', () => {
    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('es-ES', '34547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('es-ES', '+34547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('es-ES', '547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('es-ES', '+17474747474')).toBe('+17474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('en', '+1547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('en', '1547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('en', '547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('en', '+347474747474')).toBe('+347474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('en', '+34 747 474 7474')).toBe('+34 747 474 7474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(numConvert.toLocalPhone('en-EN', '+17474747474')).toBe('en-EN was not found.');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('es-ES', '34547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('es-ES', '+34547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('es-ES', '547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('es-ES', '+17474747474')).toBe('+3417474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('en', '+1547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('en', '1547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('en', '547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('en', '+347474747474')).toBe('+1347474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('en', ' + 34 747 474 7474 ')).toBe('+1 34 747 474 7474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(numConvert.fromLocalPhone('en-EN', '+17474747474')).toBe('en-EN was not found.');
    });
});
