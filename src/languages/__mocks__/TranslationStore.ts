import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import flattenObject from '@src/languages/flattenObject';
import type {FlatTranslationsObject, TranslationPaths} from '@src/languages/types';

class TranslationStore {
    private static currentLocale: ValueOf<typeof CONST.LOCALES> | undefined = 'en';

    private static localeCache = new Map<ValueOf<typeof CONST.LOCALES>, FlatTranslationsObject>([
        [
            CONST.LOCALES.EN,
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
            CONST.LOCALES.ES,
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

    private static loaders: Partial<Record<ValueOf<typeof CONST.LOCALES>, () => Promise<void>>> = {
        [CONST.LOCALES.EN]: () => {
            return Promise.resolve();
        },
        [CONST.LOCALES.ES]: () => {
            return Promise.resolve();
        },
    };

    static getCurrentLocale() {
        return this.currentLocale;
    }

    static load() {
        return Promise.resolve();
    }

    static get<TPath extends TranslationPaths>(key: TPath, locale?: ValueOf<typeof CONST.LOCALES>) {
        const localeToUse = locale && this.localeCache.has(locale) ? locale : this.currentLocale;
        if (!localeToUse) {
            return null;
        }
        const translations = this.localeCache.get(localeToUse);
        return translations?.[key] ?? null;
    }
}

export default TranslationStore;
