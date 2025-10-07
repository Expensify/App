import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import flattenObject from '@src/languages/flattenObject';
import type {FlatTranslationsObject, TranslationPaths} from '@src/languages/types';

class IntlStore {
    private static currentLocale: Locale | undefined = 'en';

    private static localeCache = new Map<Locale, FlatTranslationsObject>([
        [
            LOCALES.EN,
            flattenObject({
                testKey1: 'English',
                testKey2: 'Test Word 2',
                testKeyGroup: {
                    testFunction: ({testVariable}: {testVariable: string}) => `With variable ${testVariable}`,
                },
                pluralizationGroup: {
                    countWithoutPluralRules: ({count}: {count: number}) => `Count value is ${count}`,
                    countWithNoCorrespondingRule: ({count}: {count: number}) => ({
                        one: 'One file is being downloaded.',
                        other: `Other ${count} files are being downloaded.`,
                    }),
                },
            }),
        ],
        [
            LOCALES.ES,
            flattenObject({
                testKey1: 'Spanish',
                testKey2: 'Spanish Word 2',
                pluralizationGroup: {
                    couthWithCorrespondingRule: ({count}: {count: number}) => ({
                        one: 'Un artículo',
                        other: `${count} artículos`,
                    }),
                },
            }),
        ],
    ]);

    private static loaders: Partial<Record<Locale, () => Promise<[void, void]>>> = {
        [LOCALES.EN]: () => {
            return Promise.all([Promise.resolve(), Promise.resolve()]);
        },
        [LOCALES.ES]: () => {
            return Promise.all([Promise.resolve(), Promise.resolve()]);
        },
    };

    static getCurrentLocale() {
        return this.currentLocale;
    }

    static load() {
        return Promise.resolve();
    }

    static get<TPath extends TranslationPaths>(key: TPath, locale?: Locale) {
        const localeToUse = locale && this.localeCache.has(locale) ? locale : this.currentLocale;
        if (!localeToUse) {
            return null;
        }
        const translations = this.localeCache.get(localeToUse);
        return translations?.[key] ?? null;
    }
}

export default IntlStore;
