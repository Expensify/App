import Onyx from 'react-native-onyx';
import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import type de from './de';
import type en from './en';
import type es from './es';
import flattenObject from './flattenObject';
import type fr from './fr';
import type it from './it';
import type ja from './ja';
import type nl from './nl';
import type pl from './pl';
import type ptBR from './pt-BR';
import type {FlatTranslationsObject, TranslationPaths} from './types';
import type zhHans from './zh-hans';

// This function was added here to avoid circular dependencies
function setAreTranslationsLoading(areTranslationsLoading: boolean) {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    Onyx.set(ONYXKEYS.ARE_TRANSLATIONS_LOADING, areTranslationsLoading);
}

class TranslationStore {
    private static currentLocale: Locale | undefined = undefined;

    private static cache = new Map<Locale, FlatTranslationsObject>();

    /**
     * Set of loaders for each locale.
     * Note that this can't be trivially DRYed up because dynamic imports must use string literals in metro: https://github.com/facebook/metro/issues/52
     */
    private static loaders: Record<Locale, () => Promise<void>> = {
        [LOCALES.DE]: () =>
            this.cache.has(LOCALES.DE)
                ? Promise.resolve()
                : import('./de').then((module: {default: typeof de}) => {
                      this.cache.set(LOCALES.DE, flattenObject(module.default));
                  }),
        [LOCALES.EN]: () =>
            this.cache.has(LOCALES.EN)
                ? Promise.resolve()
                : import('./en').then((module: {default: typeof en}) => {
                      this.cache.set(LOCALES.EN, flattenObject(module.default));
                  }),
        [LOCALES.ES]: () =>
            this.cache.has(LOCALES.ES)
                ? Promise.resolve()
                : import('./es').then((module: {default: typeof es}) => {
                      this.cache.set(LOCALES.ES, flattenObject(module.default));
                  }),
        [LOCALES.FR]: () =>
            this.cache.has(LOCALES.FR)
                ? Promise.resolve()
                : import('./fr').then((module: {default: typeof fr}) => {
                      this.cache.set(LOCALES.FR, flattenObject(module.default));
                  }),
        [LOCALES.IT]: () =>
            this.cache.has(LOCALES.IT)
                ? Promise.resolve()
                : import('./it').then((module: {default: typeof it}) => {
                      this.cache.set(LOCALES.IT, flattenObject(module.default));
                  }),
        [LOCALES.JA]: () =>
            this.cache.has(LOCALES.JA)
                ? Promise.resolve()
                : import('./ja').then((module: {default: typeof ja}) => {
                      this.cache.set(LOCALES.JA, flattenObject(module.default));
                  }),
        [LOCALES.NL]: () =>
            this.cache.has(LOCALES.NL)
                ? Promise.resolve()
                : import('./nl').then((module: {default: typeof nl}) => {
                      this.cache.set(LOCALES.NL, flattenObject(module.default));
                  }),
        [LOCALES.PL]: () =>
            this.cache.has(LOCALES.PL)
                ? Promise.resolve()
                : import('./pl').then((module: {default: typeof pl}) => {
                      this.cache.set(LOCALES.PL, flattenObject(module.default));
                  }),
        [LOCALES.PT_BR]: () =>
            this.cache.has(LOCALES.PT_BR)
                ? Promise.resolve()
                : import('./pt-BR').then((module: {default: typeof ptBR}) => {
                      this.cache.set(LOCALES.PT_BR, flattenObject(module.default));
                  }),
        [LOCALES.ZH_HANS]: () =>
            this.cache.has(LOCALES.ZH_HANS)
                ? Promise.resolve()
                : import('./zh-hans').then((module: {default: typeof zhHans}) => {
                      this.cache.set(LOCALES.ZH_HANS, flattenObject(module.default));
                  }),
    };

    public static getCurrentLocale() {
        return this.currentLocale;
    }

    public static load(locale: Locale) {
        if (this.currentLocale === locale) {
            return Promise.resolve();
        }
        const loaderPromise = this.loaders[locale];
        setAreTranslationsLoading(true);
        return loaderPromise()
            .then(() => {
                this.currentLocale = locale;
            })
            .then(() => {
                setAreTranslationsLoading(false);
            });
    }

    public static get<TPath extends TranslationPaths>(key: TPath, locale?: Locale) {
        const localeToUse = locale && this.cache.has(locale) ? locale : this.currentLocale;
        if (!localeToUse) {
            return null;
        }
        const translations = this.cache.get(localeToUse);
        return translations?.[key] ?? null;
    }
}

export default TranslationStore;
