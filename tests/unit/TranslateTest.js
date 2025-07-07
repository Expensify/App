"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var en_1 = require("@src/languages/en");
var es_1 = require("@src/languages/es");
var flattenObject_1 = require("@src/languages/flattenObject");
var Localize_1 = require("@src/libs/Localize");
var asMutable_1 = require("@src/types/utils/asMutable");
var arrayDifference_1 = require("@src/utils/arrayDifference");
jest.mock('@src/languages/IntlStore');
var originalTranslations = (_a = {},
    _a[CONST_1.default.LOCALES.EN] = (0, flattenObject_1.default)(en_1.default),
    _a[CONST_1.default.LOCALES.ES] = (0, flattenObject_1.default)(es_1.default),
    _a);
describe('translate', function () {
    test('Test when key is not found in default', function () {
        expect(function () { return (0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'testKey4'); }).toThrow(Error);
    });
    test('Test when key is not found in default (Production Mode)', function () {
        var ORIGINAL_IS_IN_PRODUCTION = CONFIG_1.default.IS_IN_PRODUCTION;
        (0, asMutable_1.default)(CONFIG_1.default).IS_IN_PRODUCTION = true;
        expect((0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'testKey4')).toBe('testKey4');
        (0, asMutable_1.default)(CONFIG_1.default).IS_IN_PRODUCTION = ORIGINAL_IS_IN_PRODUCTION;
    });
    it('Test when translation value is a function', function () {
        var expectedValue = 'With variable Test Variable';
        var testVariable = 'Test Variable';
        // @ts-expect-error - TranslationPaths doesn't include testKeyGroup.testFunction as a valid key
        expect((0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'testKeyGroup.testFunction', { testVariable: testVariable })).toBe(expectedValue);
    });
    it('Test when count value passed to function but output is string', function () {
        var expectedValue = 'Count value is 10';
        var count = 10;
        // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.countWithoutPluralRules as a valid key
        expect((0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'pluralizationGroup.countWithoutPluralRules', { count: count })).toBe(expectedValue);
    });
    it('Test when count value 2 passed to function but there is no rule for the key two', function () {
        var expectedValue = 'Other 2 files are being downloaded.';
        var count = 2;
        // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.countWithNoCorrespondingRule as a valid key
        expect((0, Localize_1.translate)(CONST_1.default.LOCALES.EN, 'pluralizationGroup.countWithNoCorrespondingRule', { count: count })).toBe(expectedValue);
    });
    it('Test when count value 0, 1, 100 passed to function', function () {
        // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.couthWithCorrespondingRule as a valid key
        expect((0, Localize_1.translate)(CONST_1.default.LOCALES.ES, 'pluralizationGroup.couthWithCorrespondingRule', { count: 0 })).toBe('0 artículos');
        // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.couthWithCorrespondingRule as a valid key
        expect((0, Localize_1.translate)(CONST_1.default.LOCALES.ES, 'pluralizationGroup.couthWithCorrespondingRule', { count: 1 })).toBe('Un artículo');
        // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.couthWithCorrespondingRule as a valid key
        expect((0, Localize_1.translate)(CONST_1.default.LOCALES.ES, 'pluralizationGroup.couthWithCorrespondingRule', { count: 100 })).toBe('100 artículos');
    });
});
describe('Translation Keys', function () {
    function traverseKeyPath(source) {
        return Object.keys(source);
    }
    var excludeLanguages = [CONST_1.default.LOCALES.EN];
    var languages = Object.keys(originalTranslations).filter(function (ln) { return !excludeLanguages.some(function (excludeLanguage) { return excludeLanguage === ln; }); });
    var mainLanguage = originalTranslations.en;
    var mainLanguageKeys = traverseKeyPath(mainLanguage);
    languages.forEach(function (ln) {
        var languageKeys = traverseKeyPath(originalTranslations[ln]);
        it("Does ".concat(ln, " locale have all the keys"), function () {
            var hasAllKeys = (0, arrayDifference_1.default)(mainLanguageKeys, languageKeys);
            if (hasAllKeys.length) {
                console.debug("\uD83C\uDFF9 [ ".concat(hasAllKeys.join(', '), " ] are missing from ").concat(ln, ".js"));
                Error("\uD83C\uDFF9 [ ".concat(hasAllKeys.join(', '), " ] are missing from ").concat(ln, ".js"));
            }
            expect(hasAllKeys).toEqual([]);
        });
        it("Does ".concat(ln, " locale have unused keys"), function () {
            var hasAllKeys = (0, arrayDifference_1.default)(languageKeys, mainLanguageKeys);
            if (hasAllKeys.length) {
                console.debug("\uD83C\uDFF9 [ ".concat(hasAllKeys.join(', '), " ] are unused keys in ").concat(ln, ".js"));
                Error("\uD83C\uDFF9 [ ".concat(hasAllKeys.join(', '), " ] are unused keys in ").concat(ln, ".js"));
            }
            expect(hasAllKeys).toEqual([]);
        });
    });
});
describe('flattenObject', function () {
    it('It should work correctly', function () {
        var func = function (_a) {
            var content = _a.content;
            return "This is the content: ".concat(content);
        };
        var simpleObject = {
            common: {
                yes: 'Yes',
                no: 'No',
            },
            complex: {
                activity: {
                    none: 'No Activity',
                    some: 'Some Activity',
                },
                report: {
                    title: {
                        expense: 'Expense',
                        task: 'Task',
                    },
                    description: {
                        none: 'No description',
                    },
                    content: func,
                },
            },
        };
        var result = (0, flattenObject_1.default)(simpleObject);
        expect(result).toStrictEqual({
            'common.yes': 'Yes',
            'common.no': 'No',
            'complex.activity.none': 'No Activity',
            'complex.activity.some': 'Some Activity',
            'complex.report.title.expense': 'Expense',
            'complex.report.title.task': 'Task',
            'complex.report.description.none': 'No description',
            'complex.report.content': func,
        });
    });
});
