const localePhoneNumber = require('../../src/libs/LocalePhoneNumber');
const CONST = require('../../src/CONST').default;

describe('localePhoneNumber', () => {
    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.ES_ES, '34547474747474')).toBe('547474747474');
    });

    // Failing due to the use of Trimstart.
    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.ES_ES, '343434343434')).toBe('3434343434');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.ES_ES, '+34547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.ES_ES, '547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.ES_ES, '+17474747474')).toBe('+17474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.EN, '+1547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.EN, '1547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.EN, '547474747474')).toBe('547474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.EN, '+347474747474')).toBe('+347474747474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone(CONST.LOCALES.EN, '+34 747 474 7474')).toBe('+34 747 474 7474');
    });

    it('Test to local Number Conversion by locale', () => {
        expect(localePhoneNumber.toLocalPhone('en-EN', '+17474747474')).toBe('+17474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.ES_ES, '34547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.ES_ES, '+34547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.ES_ES, '547474747474')).toBe('+34547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.ES_ES, '+17474747474')).toBe('+3417474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.EN, '+1547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.EN, '1547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.EN, '547474747474')).toBe('+1547474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.EN, '+347474747474')).toBe('+1347474747474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone(CONST.LOCALES.EN, ' + 34 747 474 7474 ')).toBe('+1 34 747 474 7474');
    });

    it('Test to international Number Conversion by locale', () => {
        expect(localePhoneNumber.fromLocalPhone('en-EN', '+17474747474')).toBe('+17474747474');
    });
});
