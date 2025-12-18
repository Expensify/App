import {setDefaultOptions} from 'date-fns';
import type {Locale as DateUtilsLocale} from 'date-fns';
import {enGB} from 'date-fns/locale/en-GB';
import {es as esDateLocale} from 'date-fns/locale/es';
import Onyx from 'react-native-onyx';
import extractModuleDefaultExport from '@libs/extractModuleDefaultExport';
import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import type DynamicModule from '@src/types/utils/DynamicModule';
import type de from './de';
import en from './en';
import es from './es';
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

class IntlStore {
    private static currentLocale: Locale | undefined = undefined;

    /**
     * Cache for translations
     */
    private static cache = new Map<Locale, FlatTranslationsObject>();

    /**
     * Cache for localized date-fns
     * @private
     */
    private static dateUtilsCache = new Map<Locale, DateUtilsLocale>();

    /**
     * Set of loaders for each locale.
     * Note that this can't be trivially DRYed up because dynamic imports must use string literals in metro: https://github.com/facebook/metro/issues/52
     */
    private static loaders: Record<Locale, () => Promise<[void, void]>> = {
        // EN and ES are already in cache from static initializer
        [LOCALES.EN]: () => Promise.all([Promise.resolve(), Promise.resolve()]),
        [LOCALES.ES]: () => Promise.all([Promise.resolve(), Promise.resolve()]),

        // Lazy-loaded locales
        [LOCALES.DE]: () =>
            this.cache.has(LOCALES.DE)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./de').then((module: DynamicModule<typeof de>) => {
                          this.cache.set(LOCALES.DE, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/de').then((module) => {
                          this.dateUtilsCache.set(LOCALES.DE, module.de);
                      }),
                  ]),
        [LOCALES.FR]: () =>
            this.cache.has(LOCALES.FR)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./fr').then((module: DynamicModule<typeof fr>) => {
                          this.cache.set(LOCALES.FR, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/fr').then((module) => {
                          this.dateUtilsCache.set(LOCALES.FR, module.fr);
                      }),
                  ]),
        [LOCALES.IT]: () =>
            this.cache.has(LOCALES.IT)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./it').then((module: DynamicModule<typeof it>) => {
                          this.cache.set(LOCALES.IT, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/it').then((module) => {
                          this.dateUtilsCache.set(LOCALES.IT, module.it);
                      }),
                  ]),
        [LOCALES.JA]: () =>
            this.cache.has(LOCALES.JA)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./ja').then((module: DynamicModule<typeof ja>) => {
                          this.cache.set(LOCALES.JA, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/ja').then((module) => {
                          this.dateUtilsCache.set(LOCALES.JA, module.ja);
                      }),
                  ]),
        [LOCALES.NL]: () =>
            this.cache.has(LOCALES.NL)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./nl').then((module: DynamicModule<typeof nl>) => {
                          this.cache.set(LOCALES.NL, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/nl').then((module) => {
                          this.dateUtilsCache.set(LOCALES.NL, module.nl);
                      }),
                  ]),
        [LOCALES.PL]: () =>
            this.cache.has(LOCALES.PL)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./pl').then((module: DynamicModule<typeof pl>) => {
                          this.cache.set(LOCALES.PL, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/pl').then((module) => {
                          this.dateUtilsCache.set(LOCALES.PL, module.pl);
                      }),
                  ]),
        [LOCALES.PT_BR]: () =>
            this.cache.has(LOCALES.PT_BR)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./pt-BR').then((module: DynamicModule<typeof ptBR>) => {
                          this.cache.set(LOCALES.PT_BR, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/pt-BR').then((module) => {
                          this.dateUtilsCache.set(LOCALES.PT_BR, module.ptBR);
                      }),
                  ]),
        [LOCALES.ZH_HANS]: () =>
            this.cache.has(LOCALES.ZH_HANS)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./zh-hans').then((module: DynamicModule<typeof zhHans>) => {
                          this.cache.set(LOCALES.ZH_HANS, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/zh-CN').then((module) => {
                          this.dateUtilsCache.set(LOCALES.ZH_HANS, module.zhCN);
                      }),
                  ]),
    };

    public static getCurrentLocale() {
        return this.currentLocale;
    }

    /**
     * Initialize EN and ES translations.
     */
    public static init() {
        if (this.cache.has(LOCALES.EN)) {
            return;
        }
        this.cache.set(LOCALES.EN, flattenObject(en));
        this.cache.set(LOCALES.ES, flattenObject(es));
        this.dateUtilsCache.set(LOCALES.EN, enGB);
        this.dateUtilsCache.set(LOCALES.ES, esDateLocale);
    }

    public static load(locale: Locale) {
        if (this.currentLocale === locale) {
            return Promise.resolve();
        }

        const applyLocale = () => {
            this.currentLocale = locale;
            const dateUtilsLocale = this.dateUtilsCache.get(locale);
            if (dateUtilsLocale) {
                setDefaultOptions({locale: dateUtilsLocale});
            }
        };

        if (this.cache.has(locale)) {
            applyLocale();
            setAreTranslationsLoading(false);
            return Promise.resolve();
        }

        setAreTranslationsLoading(true);
        return this.loaders[locale]().then(() => {
            applyLocale();
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

export default IntlStore;
