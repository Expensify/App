/* eslint-disable @typescript-eslint/naming-convention */
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import * as translations from '@src/languages/translations';
import type {FlatTranslationsObject, TranslationDeepObject, TranslationPaths} from '@src/languages/types';
import * as Localize from '@src/libs/Localize';
import asMutable from '@src/types/utils/asMutable';
import arrayDifference from '@src/utils/arrayDifference';

const originalTranslations = {...translations};

asMutable(translations).default = {
    [CONST.LOCALES.EN]: translations.flattenObject({
        testKey1: 'English',
        testKey2: 'Test Word 2',
        testKey3: 'Test Word 3',
        testKeyGroup: {
            testFunction: ({testVariable}: {testVariable: string}) => `With variable ${testVariable}`,
        },
        pluralisationGroup: {
            countWithoutPluralRules: ({count}: {count: number}) => `Count value is ${count}`,
            countWithNoCorrespondingRule: ({count}: {count: number}) => ({
                one: 'One file is being downloaded.',
                other: `Other ${count} files are being downloaded.`,
            }),
        },
    }),
    [CONST.LOCALES.ES]: translations.flattenObject({
        testKey1: 'Spanish',
        testKey2: 'Spanish Word 2',
        pluralisationGroup: {
            couthWithCorrespondingRule: ({count}: {count: number}) => ({
                one: 'Un artículo',
                other: `${count} artículos`,
            }),
        },
    }),
    [CONST.LOCALES.ES_ES]: translations.flattenObject({testKey1: 'Spanish ES'}),
};

describe('translate', () => {
    it('Test present key in full locale', () => {
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey1' as TranslationPaths)).toBe('Spanish ES');
    });

    it('Test when key is not found in full locale, but present in language', () => {
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey2' as TranslationPaths)).toBe('Spanish Word 2');
        expect(Localize.translate(CONST.LOCALES.ES, 'testKey2' as TranslationPaths)).toBe('Spanish Word 2');
    });

    it('Test when key is not found in full locale and language, but present in default', () => {
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey3' as TranslationPaths)).toBe('Test Word 3');
    });

    test('Test when key is not found in default', () => {
        expect(() => Localize.translate(CONST.LOCALES.ES_ES, 'testKey4' as TranslationPaths)).toThrow(Error);
    });

    test('Test when key is not found in default (Production Mode)', () => {
        const ORIGINAL_IS_IN_PRODUCTION = CONFIG.IS_IN_PRODUCTION;
        asMutable(CONFIG).IS_IN_PRODUCTION = true;
        expect(Localize.translate(CONST.LOCALES.ES_ES, 'testKey4' as TranslationPaths)).toBe('testKey4');
        asMutable(CONFIG).IS_IN_PRODUCTION = ORIGINAL_IS_IN_PRODUCTION;
    });

    it('Test when translation value is a function', () => {
        const expectedValue = 'With variable Test Variable';
        const testVariable = 'Test Variable';
        // @ts-expect-error - TranslationPaths doesn't include testKeyGroup.testFunction as a valid key
        expect(Localize.translate(CONST.LOCALES.EN, 'testKeyGroup.testFunction' as TranslationPaths, {testVariable})).toBe(expectedValue);
    });

    it('Test when count value passed to function but output is string', () => {
        const expectedValue = 'Count value is 10';
        const count = 10;
        // @ts-expect-error - TranslationPaths doesn't include pluralisationGroup.countWithoutPluralRules as a valid key
        expect(Localize.translate(CONST.LOCALES.EN, 'pluralisationGroup.countWithoutPluralRules' as TranslationPaths, {count})).toBe(expectedValue);
    });

    it('Test when count value 2 passed to function but there is no rule for the key two', () => {
        const expectedValue = 'Other 2 files are being downloaded.';
        const count = 2;
        // @ts-expect-error - TranslationPaths doesn't include pluralisationGroup.countWithNoCorrespondingRule as a valid key
        expect(Localize.translate(CONST.LOCALES.EN, 'pluralisationGroup.countWithNoCorrespondingRule' as TranslationPaths, {count})).toBe(expectedValue);
    });

    it('Test when count value 0, 1, 100 passed to function', () => {
        // @ts-expect-error - TranslationPaths doesn't include pluralisationGroup.couthWithCorrespondingRule as a valid key
        expect(Localize.translate(CONST.LOCALES.ES, 'pluralisationGroup.couthWithCorrespondingRule' as TranslationPaths, {count: 0})).toBe('0 artículos');

        // @ts-expect-error - TranslationPaths doesn't include pluralisationGroup.couthWithCorrespondingRule as a valid key
        expect(Localize.translate(CONST.LOCALES.ES, 'pluralisationGroup.couthWithCorrespondingRule' as TranslationPaths, {count: 1})).toBe('Un artículo');

        // @ts-expect-error - TranslationPaths doesn't include pluralisationGroup.couthWithCorrespondingRule as a valid key
        expect(Localize.translate(CONST.LOCALES.ES, 'pluralisationGroup.couthWithCorrespondingRule' as TranslationPaths, {count: 100})).toBe('100 artículos');
    });
});

describe('Translation Keys', () => {
    function traverseKeyPath(source: FlatTranslationsObject, path?: string, keyPaths?: string[]): string[] {
        const pathArray = keyPaths ?? [];
        const keyPath = path ? `${path}.` : '';
        (Object.keys(source) as TranslationPaths[]).forEach((key) => {
            if (typeof source[key] === 'object' && typeof source[key] !== 'function') {
                // @ts-expect-error - We are modifying the translations object for testing purposes
                traverseKeyPath(source[key], keyPath + key, pathArray);
            } else {
                pathArray.push(keyPath + key);
            }
        });

        return pathArray;
    }

    const excludeLanguages = [CONST.LOCALES.EN, CONST.LOCALES.ES_ES];
    const languages = Object.keys(originalTranslations.default).filter((ln) => !excludeLanguages.some((excludeLanguage) => excludeLanguage === ln));
    const mainLanguage = originalTranslations.default.en;
    const mainLanguageKeys = traverseKeyPath(mainLanguage);

    languages.forEach((ln) => {
        const languageKeys = traverseKeyPath(originalTranslations.default[ln as keyof typeof originalTranslations.default]);

        it(`Does ${ln} locale have all the keys`, () => {
            const hasAllKeys = arrayDifference(mainLanguageKeys, languageKeys);
            if (hasAllKeys.length) {
                console.debug(`🏹 [ ${hasAllKeys.join(', ')} ] are missing from ${ln}.js`);
                Error(`🏹 [ ${hasAllKeys.join(', ')} ] are missing from ${ln}.js`);
            }
            expect(hasAllKeys).toEqual([]);
        });

        it(`Does ${ln} locale have unused keys`, () => {
            const hasAllKeys = arrayDifference(languageKeys, mainLanguageKeys);
            if (hasAllKeys.length) {
                console.debug(`🏹 [ ${hasAllKeys.join(', ')} ] are unused keys in ${ln}.js`);
                Error(`🏹 [ ${hasAllKeys.join(', ')} ] are unused keys in ${ln}.js`);
            }
            expect(hasAllKeys).toEqual([]);
        });
    });
});

type ReportContentArgs = {content: string};

describe('flattenObject', () => {
    it('It should work correctly', () => {
        const func = ({content}: ReportContentArgs) => `This is the content: ${content}`;
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
                },
            },
        };

        const result = translations.flattenObject(simpleObject as TranslationDeepObject<typeof simpleObject>);
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
