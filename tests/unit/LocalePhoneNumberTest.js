const localePhoneNumber = require('../../src/libs/LocalePhoneNumber');

describe('localePhoneNumber', () => {
    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('es-ES', '34547474747474')).toBe('547474747474');
    });

    // Failing due to the use of Trimstart.
    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('es-ES', '343434343434')).toBe('3434343434');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('es-ES', '+34547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('es-ES', '547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('es-ES', '+17474747474')).toBe('+17474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('en', '+1547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('en', '1547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('en', '547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('en', '+347474747474')).toBe('+347474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('en', '+34 747 474 7474')).toBe('+34 747 474 7474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('en-EN', '+17474747474')).toBe('+17474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('es-ES', '34547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('es-ES', '+34547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('es-ES', '547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('es-ES', '+17474747474')).toBe('+3417474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('en', '+1547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('en', '1547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('en', '547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('en', '+347474747474')).toBe('+1347474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('en', ' + 34 747 474 7474 ')).toBe('+1 34 747 474 7474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('en-EN', '+17474747474')).toBe('+17474747474');
    });
});
