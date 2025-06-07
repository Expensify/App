import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import flattenObject from './flattenObject';
import type {FlatTranslationsObject, TranslationPaths} from './types';

// This function was added here to avoid circular dependencies
function setAreTranslationsLoading(areTranslationsLoading: boolean) {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    Onyx.set(ONYXKEYS.ARE_TRANSLATIONS_LOADING, areTranslationsLoading);
}

class TranslationStore {
    private static currentLocale: ValueOf<typeof CONST.LOCALES> | undefined = undefined;

    private static localeCache = new Map<ValueOf<typeof CONST.LOCALES>, FlatTranslationsObject>();

    private static loaders: Partial<Record<ValueOf<typeof CONST.LOCALES>, () => Promise<void>>> = {
        [CONST.LOCALES.EN]: () => {
            if (this.localeCache.has(CONST.LOCALES.EN)) {
                return Promise.resolve();
            }
            return import('./en').then((module) => {
                // it is needed because in jest test the modules are imported in double nested default object
                const flattened = flattenObject(
                    (module.default as Record<string, unknown>).default ? ((module.default as Record<string, unknown>).default as typeof module.default) : module.default,
                );
                this.localeCache.set(CONST.LOCALES.EN, flattened);
            });
        },
        [CONST.LOCALES.ES]: () => {
            if (this.localeCache.has(CONST.LOCALES.ES)) {
                return Promise.resolve();
            }
            return import('./es').then((module) => {
                // it is needed because in jest test the modules are imported in double nested default object
                const flattened = flattenObject(
                    (module.default as Record<string, unknown>).default ? ((module.default as Record<string, unknown>).default as typeof module.default) : module.default,
                );
                this.localeCache.set(CONST.LOCALES.ES, flattened);
            });
        },
    };

    static getCurrentLocale() {
        return this.currentLocale;
    }

    static load(locale: ValueOf<typeof CONST.LOCALES>) {
        if (this.currentLocale === locale) {
            return Promise.resolve();
        }
        const loaderPromise = this.loaders[locale] ?? (() => Promise.resolve());
        setAreTranslationsLoading(true);
        return loaderPromise()
            .then(() => {
                this.currentLocale = locale;
            })
            .then(() => {
                setAreTranslationsLoading(false);
            });
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
