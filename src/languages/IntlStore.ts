import {setDefaultOptions} from 'date-fns';
import type {Locale as DateUtilsLocale} from 'date-fns';
import {enGB} from 'date-fns/locale/en-GB';
import extractModuleDefaultExport from '@libs/extractModuleDefaultExport';
import CONST from '@src/CONST';
import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import type DynamicModule from '@src/types/utils/DynamicModule';
import type de from './de';
import en from './en';
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

class IntlStore {
    private static currentLocale: Locale = CONST.LOCALES.DEFAULT;

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
    private static loaders: Record<Locale, () => Promise<void> | void> = {
        // EN is already in cache from static initializer
        [LOCALES.EN]: () => {},

        // Lazy-loaded locales
        [LOCALES.ES]: () => {
            if (this.cache.has(LOCALES.ES)) {
                return;
            }
            return Promise.all([
                import('./es').then((module: DynamicModule<typeof es>) => {
                    this.cache.set(LOCALES.ES, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/es').then((module) => {
                    this.dateUtilsCache.set(LOCALES.ES, module.es);
                }),
            ]).then(() => {});
        },
        [LOCALES.DE]: () => {
            if (this.cache.has(LOCALES.DE)) {
                return;
            }
            return Promise.all([
                import('./de').then((module: DynamicModule<typeof de>) => {
                    this.cache.set(LOCALES.DE, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/de').then((module) => {
                    this.dateUtilsCache.set(LOCALES.DE, module.de);
                }),
            ]).then(() => {});
        },
        [LOCALES.FR]: () => {
            if (this.cache.has(LOCALES.FR)) {
                return;
            }
            return Promise.all([
                import('./fr').then((module: DynamicModule<typeof fr>) => {
                    this.cache.set(LOCALES.FR, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/fr').then((module) => {
                    this.dateUtilsCache.set(LOCALES.FR, module.fr);
                }),
            ]).then(() => {});
        },
        [LOCALES.IT]: () => {
            if (this.cache.has(LOCALES.IT)) {
                return;
            }
            return Promise.all([
                import('./it').then((module: DynamicModule<typeof it>) => {
                    this.cache.set(LOCALES.IT, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/it').then((module) => {
                    this.dateUtilsCache.set(LOCALES.IT, module.it);
                }),
            ]).then(() => {});
        },
        [LOCALES.JA]: () => {
            if (this.cache.has(LOCALES.JA)) {
                return;
            }
            return Promise.all([
                import('./ja').then((module: DynamicModule<typeof ja>) => {
                    this.cache.set(LOCALES.JA, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/ja').then((module) => {
                    this.dateUtilsCache.set(LOCALES.JA, module.ja);
                }),
            ]).then(() => {});
        },
        [LOCALES.NL]: () => {
            if (this.cache.has(LOCALES.NL)) {
                return;
            }
            return Promise.all([
                import('./nl').then((module: DynamicModule<typeof nl>) => {
                    this.cache.set(LOCALES.NL, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/nl').then((module) => {
                    this.dateUtilsCache.set(LOCALES.NL, module.nl);
                }),
            ]).then(() => {});
        },
        [LOCALES.PL]: () => {
            if (this.cache.has(LOCALES.PL)) {
                return;
            }
            return Promise.all([
                import('./pl').then((module: DynamicModule<typeof pl>) => {
                    this.cache.set(LOCALES.PL, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/pl').then((module) => {
                    this.dateUtilsCache.set(LOCALES.PL, module.pl);
                }),
            ]).then(() => {});
        },
        [LOCALES.PT_BR]: () => {
            if (this.cache.has(LOCALES.PT_BR)) {
                return;
            }
            return Promise.all([
                import('./pt-BR').then((module: DynamicModule<typeof ptBR>) => {
                    this.cache.set(LOCALES.PT_BR, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/pt-BR').then((module) => {
                    this.dateUtilsCache.set(LOCALES.PT_BR, module.ptBR);
                }),
            ]).then(() => {});
        },
        [LOCALES.ZH_HANS]: () => {
            if (this.cache.has(LOCALES.ZH_HANS)) {
                return;
            }
            return Promise.all([
                import('./zh-hans').then((module: DynamicModule<typeof zhHans>) => {
                    this.cache.set(LOCALES.ZH_HANS, flattenObject(extractModuleDefaultExport(module)));
                }),
                import('date-fns/locale/zh-CN').then((module) => {
                    this.dateUtilsCache.set(LOCALES.ZH_HANS, module.zhCN);
                }),
            ]).then(() => {});
        },
    };

    public static getCurrentLocale() {
        return this.currentLocale;
    }

    /**
     * Initialize EN translations.
     */
    public static init() {
        if (this.cache.has(LOCALES.EN)) {
            return;
        }
        this.cache.set(LOCALES.EN, flattenObject(en));
        this.dateUtilsCache.set(LOCALES.EN, enGB);
    }

    public static load(locale: Locale): Promise<void> | void {
        if (this.currentLocale === locale) {
            return;
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
            return;
        }

        const loaderResult = this.loaders[locale]();
        if (loaderResult instanceof Promise) {
            return loaderResult.then(applyLocale);
        }

        applyLocale();
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
