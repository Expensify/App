/* eslint-disable @typescript-eslint/naming-convention */
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import de from '@src/languages/de';
import en from '@src/languages/en';
import es from '@src/languages/es';
import flattenObject from '@src/languages/flattenObject';
import fr from '@src/languages/fr';
import itTranslations from '@src/languages/it';
import ja from '@src/languages/ja';
import type {FlatTranslationsObject} from '@src/languages/types';
import zhHans from '@src/languages/zh-hans';
import {translate} from '@src/libs/Localize';
import asMutable from '@src/types/utils/asMutable';
import arrayDifference from '@src/utils/arrayDifference';

jest.mock('@src/languages/IntlStore');

// The unit-test environment does not register this native module, but CONFIG imports it during test initialization.
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: jest.fn(() => false)},
}));

const originalTranslations = {
    [CONST.LOCALES.EN]: flattenObject(en),
    [CONST.LOCALES.ES]: flattenObject(es),
};

describe('TranslateTest', () => {
    describe('translate', () => {
        test('Test when key is not found in default', () => {
            // @ts-expect-error - This deliberately exercises a missing translation key.
            expect(() => translate(CONST.LOCALES.EN, 'testKey4')).toThrow(Error);
        });

        test('Test when key is not found in default (Production Mode)', () => {
            const ORIGINAL_IS_IN_PRODUCTION = CONFIG.IS_IN_PRODUCTION;
            asMutable(CONFIG).IS_IN_PRODUCTION = true;
            // @ts-expect-error - This deliberately exercises a missing translation key.
            expect(translate(CONST.LOCALES.EN, 'testKey4')).toBe('testKey4');
            asMutable(CONFIG).IS_IN_PRODUCTION = ORIGINAL_IS_IN_PRODUCTION;
        });

        it('Test when translation value is a function', () => {
            const expectedValue = 'With variable Test Variable';
            const testVariable = 'Test Variable';
            // @ts-expect-error - TranslationPaths doesn't include testKeyGroup.testFunction as a valid key
            expect(translate(CONST.LOCALES.EN, 'testKeyGroup.testFunction', {testVariable})).toBe(expectedValue);
        });

        it('uses the accounting integration display name in connection messages', () => {
            const connectionName = 'Intuit Enterprise Suite';

            expect(en.workspace.accounting.syncError(connectionName)).toBe("Can't connect to Intuit Enterprise Suite");
            expect(en.workspace.accounting.disconnectTitle(connectionName)).toBe('Disconnect Intuit Enterprise Suite');
            expect(en.workspace.accounting.disconnectPrompt(connectionName)).toBe('Are you sure you want to disconnect Intuit Enterprise Suite?');
        });

        it('only names a fallback vendor when the integration auto-creates one', () => {
            // QBO card exports and Intacct credit-card charges auto-create the vendor, and its name follows the card type.
            expect(en.workspace.accounting.defaultVendorHelperText(false, CONST.NON_REIMBURSABLE_FALLBACK_VENDOR_NAME.CREDIT_CARD)).toBe(
                "Expenses that don't auto-match will default to this vendor. Otherwise, they'll export as Credit Card Misc.",
            );
            expect(en.workspace.accounting.defaultVendorHelperText(false, CONST.NON_REIMBURSABLE_FALLBACK_VENDOR_NAME.DEBIT_CARD)).toBe(
                "Expenses that don't auto-match will default to this vendor. Otherwise, they'll export as Debit Card Misc.",
            );

            // Xero posts card expenses as bank transactions and never creates a stand-in vendor, so it passes no name.
            expect(en.workspace.accounting.defaultVendorHelperText(false)).toBe("Expenses that don't auto-match will default to this vendor.");
            expect(en.workspace.accounting.defaultVendorHelperText(true, CONST.NON_REIMBURSABLE_FALLBACK_VENDOR_NAME.CREDIT_CARD)).toBe(
                "Expenses that don't auto-match will default to this vendor.",
            );
        });

        it('uses the QBO fallback vendor name and locale punctuation in default-vendor helper text', () => {
            const creditCardFallbackVendorName = CONST.NON_REIMBURSABLE_FALLBACK_VENDOR_NAME.CREDIT_CARD;

            expect(de.workspace.accounting.defaultVendorHelperText(false, creditCardFallbackVendorName)).toContain('„Credit Card Misc.“');
            expect(de.workspace.accounting.defaultVendorHelperText(false, creditCardFallbackVendorName)).toMatch(/\.$/);
            expect(fr.workspace.accounting.defaultVendorHelperText(false, creditCardFallbackVendorName)).toContain('Credit Card Misc.');
            expect(itTranslations.workspace.accounting.defaultVendorHelperText(false, creditCardFallbackVendorName)).toContain('Credit Card Misc.');
            expect(ja.workspace.accounting.defaultVendorHelperText(false, creditCardFallbackVendorName)).toBe(
                '自動照合されない経費はデフォルトでこのベンダーに割り当てられます。それ以外は「Credit Card Misc.」としてエクスポートされます。',
            );
            expect(zhHans.workspace.accounting.defaultVendorHelperText(false, creditCardFallbackVendorName)).toBe(
                '未自动匹配的报销将默认归属于此供应商。否则，它们将按“Credit Card Misc.”导出。',
            );
        });

        it('Test when count value passed to function but output is string', () => {
            const expectedValue = 'Count value is 10';
            const count = 10;
            // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.countWithoutPluralRules as a valid key
            expect(translate(CONST.LOCALES.EN, 'pluralizationGroup.countWithoutPluralRules', {count})).toBe(expectedValue);
        });

        it('Test when count value 2 passed to function but there is no rule for the key two', () => {
            const expectedValue = 'Other 2 files are being downloaded.';
            const count = 2;
            // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.countWithNoCorrespondingRule as a valid key
            expect(translate(CONST.LOCALES.EN, 'pluralizationGroup.countWithNoCorrespondingRule', {count})).toBe(expectedValue);
        });

        it('Test when count value 0, 1, 100 passed to function', () => {
            // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.couthWithCorrespondingRule as a valid key
            expect(translate(CONST.LOCALES.ES, 'pluralizationGroup.couthWithCorrespondingRule', {count: 0})).toBe('0 artículos');

            // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.couthWithCorrespondingRule as a valid key
            expect(translate(CONST.LOCALES.ES, 'pluralizationGroup.couthWithCorrespondingRule', {count: 1})).toBe('Un artículo');

            // @ts-expect-error - TranslationPaths doesn't include pluralizationGroup.couthWithCorrespondingRule as a valid key
            expect(translate(CONST.LOCALES.ES, 'pluralizationGroup.couthWithCorrespondingRule', {count: 100})).toBe('100 artículos');
        });
    });

    describe('Translation Keys', () => {
        function traverseKeyPath(source: FlatTranslationsObject): string[] {
            return Object.keys(source);
        }

        const excludeLanguages = new Set<string>([CONST.LOCALES.EN]);
        const mainLanguage = originalTranslations.en;
        const mainLanguageKeys = traverseKeyPath(mainLanguage);

        for (const [ln, language] of Object.entries(originalTranslations).filter(([locale]) => !excludeLanguages.has(locale))) {
            const languageKeys = traverseKeyPath(language);

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
        }
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

            const result = flattenObject<typeof simpleObject>(simpleObject);
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
});
