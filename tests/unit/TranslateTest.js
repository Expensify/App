const _ = require('underscore');
const {error: AnnotationError} = require('@actions/core');
const Localize = require('../../src/libs/Localize');
const CONFIG = require('../../src/CONFIG');
const translations = require('../../src/languages/translations');
const CONST = require('../../src/CONST').default;

const originalTranslations = _.clone(translations);
translations.default = {
    [CONST.LOCALES.EN]: translations.flattenObject({
        testKey1: 'English',
        testKey2: 'Test Word 2',
        testKey3: 'Test Word 3',
        testKeyGroup: {
            testFunction: ({testVariable}) => `With variable ${testVariable}`,
        },
    }),
    [CONST.LOCALES.ES]: translations.flattenObject({
        testKey1: 'Spanish',
        testKey2: 'Spanish Word 2',
    }),
    [CONST.LOCALES.ES_ES]: translations.flattenObject({testKey1: 'Spanish ES'}),
};

describe('translate', () => {
    it('Test present key in full locale', () => {
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey1')).toBe('Spanish ES');
    });

    it('Test when key is not found in full locale, but present in language', () => {
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey2')).toBe('Spanish Word 2');
        expect(Localize.translate(CONST.LOCALES.ES, 'testKey2')).toBe('Spanish Word 2');
    });

    it('Test when key is not found in full locale and language, but present in default', () => {
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey3')).toBe('Test Word 3');
    });

    test('Test when key is not found in default', () => {
        expect(() => Localize.translate(CONST.LOCALES.ES_ES, 'testKey4')).toThrow(Error);
    });

    test('Test when key is not found in default (Production Mode)', () => {
        const ORIGINAL_IS_IN_PRODUCTION = CONFIG.default.IS_IN_PRODUCTION;
        CONFIG.default.IS_IN_PRODUCTION = true;
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey4')).toBe('testKey4');
        CONFIG.default.IS_IN_PRODUCTION = ORIGINAL_IS_IN_PRODUCTION;
    });

    it('Test when translation value is a function', () => {
        const expectedValue = 'With variable Test Variable';
        const testVariable = 'Test Variable';
        expect(Localize.translate(CONST.LOCALES.EN, 'testKeyGroup.testFunction', {testVariable})).toBe(expectedValue);
    });
});

describe('Translation Keys', () => {
    function traverseKeyPath(source, path, keyPaths) {
        const pathArray = keyPaths || [];
        const keyPath = path ? `${path}.` : '';
        _.each(_.keys(source), (key) => {
            if (_.isObject(source[key]) && !_.isFunction(source[key])) {
                traverseKeyPath(source[key], keyPath + key, pathArray);
            } else {
                pathArray.push(keyPath + key);
            }
        });
        return pathArray;
    }
    const excludeLanguages = [CONST.LOCALES.EN, CONST.LOCALES.ES_ES];
    const languages = _.without(_.keys(originalTranslations.default), ...excludeLanguages);
    const mainLanguage = originalTranslations.default.en;
    const mainLanguageKeys = traverseKeyPath(mainLanguage);

    _.each(languages, (ln) => {
        const languageKeys = traverseKeyPath(originalTranslations.default[ln]);

        it(`Does ${ln} locale have all the keys`, () => {
            const hasAllKeys = _.difference(mainLanguageKeys, languageKeys);
            if (hasAllKeys.length) {
                console.debug(`🏹 [ ${hasAllKeys.join(', ')} ] are missing from ${ln}.js`);
                AnnotationError(`🏹 [ ${hasAllKeys.join(', ')} ] are missing from ${ln}.js`);
            }
            expect(hasAllKeys).toEqual([]);
        });

        it(`Does ${ln} locale have unused keys`, () => {
            const hasAllKeys = _.difference(languageKeys, mainLanguageKeys);
            if (hasAllKeys.length) {
                console.debug(`🏹 [ ${hasAllKeys.join(', ')} ] are unused keys in ${ln}.js`);
                AnnotationError(`🏹 [ ${hasAllKeys.join(', ')} ] are unused keys in ${ln}.js`);
            }
            expect(hasAllKeys).toEqual([]);
        });
    });
});

describe('flattenObject', () => {
    it('It should work correctly', () => {
        const func = ({content}) => `This is the content: ${content}`;
        const simpleObject = {
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
                    messages: ['Hello', 'Hi', 'Sup!'],
                },
            },
        };

        const result = translations.flattenObject(simpleObject);
        expect(result).toStrictEqual({
            'common.yes': 'Yes',
            'common.no': 'No',
            'complex.activity.none': 'No Activity',
            'complex.activity.some': 'Some Activity',
            'complex.report.title.expense': 'Expense',
            'complex.report.title.task': 'Task',
            'complex.report.description.none': 'No description',
            'complex.report.content': func,
            'complex.report.messages': ['Hello', 'Hi', 'Sup!'],
        });
    });
});
