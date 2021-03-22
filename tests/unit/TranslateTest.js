const translate = require('../../src/libs/translate');
const translations = require('../../src/languages/translations');
const CONFIG = require('../../src/CONFIG');

translations.default = {
    en: {
        testKey1: 'English',
        testKey2: 'Test Word 2',
        testKey3: 'Test Word 3',
        testKeyGroup: {
            testFunction: ({testVariable}) => `With variable ${testVariable}`,
        },
    },
    es: {
        testKey1: 'Spanish',
        testKey2: 'Spanish Word 2',
    },
    'es-ES': {testKey1: 'Spanish ES'},
};

describe('translate', () => {
    it('Test present key in full locale', () => {
        expect(translate.translate('es-ES', 'testKey1')).toBe('Spanish ES');
    });

    it('Test when key is not found in full locale, but present in language', () => {
        expect(translate.translate('es-ES', 'testKey2')).toBe('Spanish Word 2');
        expect(translate.translate('es', 'testKey2')).toBe('Spanish Word 2');
    });

    it('Test when key is not found in full locale and language, but present in default', () => {
        expect(translate.translate('es-ES', 'testKey3')).toBe('Test Word 3');
    });

    test('Test when key is not found in default', () => {
        expect(() => translate.translate('es-ES', 'testKey4')).toThrow(Error);
        expect(() => translate.translate('es-ES', ['a', 'b', 'c'])).toThrow(Error);
    });

    test('Test when key is not found in default (Production Mode)', () => {
        const ORIGINAL_IS_IN_PRODUCTION = CONFIG.default.IS_IN_PRODUCTION;
        CONFIG.default.IS_IN_PRODUCTION = true;
        expect(translate.translate('es-ES', 'testKey4')).toBe('testKey4');
        expect(translate.translate('es-ES', ['a', 'b', 'c'])).toBe('a.b.c');
        CONFIG.default.IS_IN_PRODUCTION = ORIGINAL_IS_IN_PRODUCTION;
    });

    it('Test when translation value is a function', () => {
        const expectedValue = 'With variable Test Variable';
        const testVariable = 'Test Variable';
        expect(translate.translate('en', 'testKeyGroup.testFunction', {testVariable})).toBe(expectedValue);
        expect(translate.translate('en', ['testKeyGroup', 'testFunction'], {testVariable})).toBe(expectedValue);
    });
});
