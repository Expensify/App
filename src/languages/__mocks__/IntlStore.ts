import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import flattenObject from '@src/languages/flattenObject';
import type {FlatTranslationsObject, TranslationPaths} from '@src/languages/types';

class IntlStore {
    private static currentLocale: Locale = 'en';

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

    private static listeners = new Set<() => void>();

    // One cached snapshot, so repeated `useSyncExternalStore` reads return the same reference. Replaced, never mutated.
    private static snapshot: {locale: Locale; loaded: boolean; hasAnyTranslations: boolean} = {
        locale: IntlStore.currentLocale,
        loaded: IntlStore.localeCache.has(IntlStore.currentLocale),
        hasAnyTranslations: IntlStore.localeCache.size > 0,
    };

    static getCurrentLocale() {
        return IntlStore.currentLocale;
    }

    static load(locale?: Locale): Promise<void> {
        // Real behaviour, otherwise a suite exercising a locale switch sees no effect and passes for the wrong reason.
        if (locale && IntlStore.localeCache.has(locale)) {
            IntlStore.currentLocale = locale;
            IntlStore.snapshot = {locale, loaded: true, hasAnyTranslations: true};
            for (const listener of IntlStore.listeners) {
                listener();
            }
        }
        return Promise.resolve();
    }

    static get<TPath extends TranslationPaths>(key: TPath, locale?: Locale) {
        const localeToUse = locale && IntlStore.localeCache.has(locale) ? locale : IntlStore.currentLocale;
        const translations = IntlStore.localeCache.get(localeToUse);
        return translations?.[key] ?? null;
    }

    static subscribe(listener: () => void): () => void {
        IntlStore.listeners.add(listener);
        return () => {
            IntlStore.listeners.delete(listener);
        };
    }

    static getSnapshot(): {locale: Locale; loaded: boolean; hasAnyTranslations: boolean} {
        return IntlStore.snapshot;
    }

    static hasLocale(locale: Locale): boolean {
        return IntlStore.localeCache.has(locale);
    }
}

export default IntlStore;
