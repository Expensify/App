/* eslint-disable @typescript-eslint/naming-convention */
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import * as translations from '@src/languages/translations';
import type {TranslationFlatObject, TranslationPaths} from '@src/languages/types';
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
            testFunction: ({testVariable}) => `With variable ${testVariable}`,
        },
        testPlural: ({count}) => {
            const enPluralRules = new Intl.PluralRules('en', {type: 'ordinal'});
            const pluralType = enPluralRules.select(count);
            switch (pluralType) {
                case 'one':
                    return `You have one item`;
                default:
                    return `You have many items`;
            }
        },
        ordinalExample: ({count}) => {
            const enPluralRules = new Intl.PluralRules('en', {type: 'ordinal'});
            const pluralType = enPluralRules.select(count);
            switch (pluralType) {
                case 'one':
                    return `${count}st item`;
                case 'two':
                    return `${count}nd item`;
                case 'few':
                    return `${count}rd item`;
                default:
                    return `${count}th item`;
            }
        },
    }),
    [CONST.LOCALES.ES]: translations.flattenObject({
        testKey1: 'Spanish',
        testKey2: 'Spanish Word 2',
        ordinalExample: ({count}) => {
            const esPluralRules = new Intl.PluralRules('es', {type: 'ordinal'});
            const pluralType = esPluralRules.select(count);
            switch (pluralType) {
                case 'one':
                    return `${count}º elemento`;
                default:
                    return `${count}ª elemento`;
            }
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
        expect(Localize.translate(CONST.LOCALES.EN, 'testKeyGroup.testFunction' as TranslationPaths, {testVariable})).toBe(expectedValue);
    });
});

describe('Translation Keys', () => {
    function traverseKeyPath(source: TranslationFlatObject, path?: string, keyPaths?: string[]): string[] {
        const pathArray = keyPaths ?? [];
        const keyPath = path ? `${path}.` : '';
        (Object.keys(source) as Array<keyof TranslationFlatObject>).forEach((key) => {
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

describe('plural translations', () => {
    it('should return the correct pluralized form for "one" case', () => {
        const phraseKey = 'testPlural' as TranslationPaths;
        const phraseParameters = {count: 1};
        const expectedTranslation = 'You have one item';

        const translation = Localize.translate(CONST.LOCALES.EN, phraseKey, phraseParameters);
        expect(translation).toBe(expectedTranslation);
    });

    it('should return the correct pluralized form for "other" case', () => {
        const phraseKey = 'testPlural' as TranslationPaths;
        const phraseParameters = {count: 5};
        const expectedTranslation = 'You have many items';

        const translation = Localize.translate(CONST.LOCALES.EN, phraseKey, phraseParameters);
        expect(translation).toBe(expectedTranslation);
    });

    it('should return the "other" form if the specific plural form is not found', () => {
        const phraseKey = 'testPlural' as TranslationPaths;
        const phraseParameters = {count: 2};
        const expectedTranslation = 'You have many items';

        const translation = Localize.translate(CONST.LOCALES.EN, phraseKey, ...phraseParameters);
        expect(translation).toBe(expectedTranslation);
    });

    it('should handle plural translations with variables', () => {
        const phraseKey = 'testPlural' as TranslationPaths;
        const phraseParameters = {count: 3, itemName: 'books'};
        const expectedTranslation = 'You have many items';

        const translation = Localize.translate(CONST.LOCALES.EN, phraseKey, ...phraseParameters);
        expect(translation).toBe(expectedTranslation);
    });

    it('should return the correct pluralized form for "one" case in English', () => {
        const phraseKey = 'ordinalExample' as TranslationPaths;
        const phraseParameters = {count: 1};
        const expectedTranslation = '1st item';

        const translation = Localize.translate(CONST.LOCALES.EN, phraseKey, ...phraseParameters);
        expect(translation).toBe(expectedTranslation);
    });

    it('should return the correct pluralized form for "other" case in English', () => {
        const phraseKey = 'ordinalExample' as TranslationPaths;
        const phraseParameters = {count: 11};
        const expectedTranslation = '11th item';

        const translation = Localize.translate(CONST.LOCALES.EN, phraseKey, ...phraseParameters);
        expect(translation).toBe(expectedTranslation);
    });

    it('should return the correct pluralized form for Spanish', () => {
        const phraseKey = 'ordinalExample' as TranslationPaths;
        const phraseParameters = {count: 23};
        const expectedTranslation = '23ª elemento';

        const translation = Localize.translate(CONST.LOCALES.ES, phraseKey, ...phraseParameters);
        expect(translation).toBe(expectedTranslation);
    });
});
