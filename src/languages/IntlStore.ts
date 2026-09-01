import extractModuleDefaultExport from '@libs/extractModuleDefaultExport';
import {endSpan, endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import type DynamicModule from '@src/types/utils/DynamicModule';
import retryDynamicImport from '@src/utils/retryDynamicImport';

import type {Locale as DateUtilsLocale} from 'date-fns';

import * as Sentry from '@sentry/react-native';
import {setDefaultOptions} from 'date-fns';
import Onyx from 'react-native-onyx';

import type de from './de';
import type el from './el';
import type en from './en';
import type es from './es';
import type fr from './fr';
import type it from './it';
import type ja from './ja';
import type nl from './nl';
import type pl from './pl';
import type ptBR from './pt-BR';
import type {FlatTranslationsObject, TranslationPaths} from './types';
import type zhHans from './zh-hans';

import flattenObject from './flattenObject';
import {shouldPolyfillNumberFormat, shouldPolyfillListFormat, shouldPolyfillPluralRules} from './shouldPolyfill';

// This function was added here to avoid circular dependencies
function setAreTranslationsLoading(areTranslationsLoading: boolean) {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    Onyx.set(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING, areTranslationsLoading);
}

// Scopes the dynamic-import retry state per locale
const LOCALE_RETRY_KEY_PREFIX = 'locale:';

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
     * @formatjs locale data is keyed by the base CLDR tag, so pt covers pt-BR and zh covers zh-hans.
     */
    private static loaders: Record<Locale, () => Promise<unknown[]>> = {
        [LOCALES.DE]: () =>
            this.cache.has(LOCALES.DE)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./de').then((module: DynamicModule<typeof de>) => {
                          this.cache.set(LOCALES.DE, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/de').then((module) => {
                          this.dateUtilsCache.set(LOCALES.DE, module.de);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.DE) ? import('@formatjs/intl-numberformat/locale-data/de') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.DE) ? import('@formatjs/intl-listformat/locale-data/de') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.DE) ? import('@formatjs/intl-pluralrules/locale-data/de') : Promise.resolve(),
                  ]),
        [LOCALES.EL]: () =>
            this.cache.has(LOCALES.EL)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./el').then((module: DynamicModule<typeof el>) => {
                          this.cache.set(LOCALES.EL, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/el').then((module) => {
                          this.dateUtilsCache.set(LOCALES.EL, module.el);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.EL) ? import('@formatjs/intl-numberformat/locale-data/el') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.EL) ? import('@formatjs/intl-listformat/locale-data/el') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.EL) ? import('@formatjs/intl-pluralrules/locale-data/el') : Promise.resolve(),
                  ]),
        [LOCALES.EN]: () =>
            this.cache.has(LOCALES.EN)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./en').then((module: DynamicModule<typeof en>) => {
                          this.cache.set(LOCALES.EN, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/en-GB').then((module) => {
                          this.dateUtilsCache.set(LOCALES.EN, module.enGB);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.EN) ? import('@formatjs/intl-numberformat/locale-data/en') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.EN) ? import('@formatjs/intl-listformat/locale-data/en') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.EN) ? import('@formatjs/intl-pluralrules/locale-data/en') : Promise.resolve(),
                  ]),
        [LOCALES.ES]: () =>
            this.cache.has(LOCALES.ES)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./es').then((module: DynamicModule<typeof es>) => {
                          this.cache.set(LOCALES.ES, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/es').then((module) => {
                          this.dateUtilsCache.set(LOCALES.ES, module.es);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.ES) ? import('@formatjs/intl-numberformat/locale-data/es') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.ES) ? import('@formatjs/intl-listformat/locale-data/es') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.ES) ? import('@formatjs/intl-pluralrules/locale-data/es') : Promise.resolve(),
                  ]),
        [LOCALES.FR]: () =>
            this.cache.has(LOCALES.FR)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./fr').then((module: DynamicModule<typeof fr>) => {
                          this.cache.set(LOCALES.FR, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/fr').then((module) => {
                          this.dateUtilsCache.set(LOCALES.FR, module.fr);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.FR) ? import('@formatjs/intl-numberformat/locale-data/fr') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.FR) ? import('@formatjs/intl-listformat/locale-data/fr') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.FR) ? import('@formatjs/intl-pluralrules/locale-data/fr') : Promise.resolve(),
                  ]),
        [LOCALES.IT]: () =>
            this.cache.has(LOCALES.IT)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./it').then((module: DynamicModule<typeof it>) => {
                          this.cache.set(LOCALES.IT, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/it').then((module) => {
                          this.dateUtilsCache.set(LOCALES.IT, module.it);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.IT) ? import('@formatjs/intl-numberformat/locale-data/it') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.IT) ? import('@formatjs/intl-listformat/locale-data/it') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.IT) ? import('@formatjs/intl-pluralrules/locale-data/it') : Promise.resolve(),
                  ]),
        [LOCALES.JA]: () =>
            this.cache.has(LOCALES.JA)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./ja').then((module: DynamicModule<typeof ja>) => {
                          this.cache.set(LOCALES.JA, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/ja').then((module) => {
                          this.dateUtilsCache.set(LOCALES.JA, module.ja);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.JA) ? import('@formatjs/intl-numberformat/locale-data/ja') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.JA) ? import('@formatjs/intl-listformat/locale-data/ja') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.JA) ? import('@formatjs/intl-pluralrules/locale-data/ja') : Promise.resolve(),
                  ]),
        [LOCALES.NL]: () =>
            this.cache.has(LOCALES.NL)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./nl').then((module: DynamicModule<typeof nl>) => {
                          this.cache.set(LOCALES.NL, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/nl').then((module) => {
                          this.dateUtilsCache.set(LOCALES.NL, module.nl);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.NL) ? import('@formatjs/intl-numberformat/locale-data/nl') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.NL) ? import('@formatjs/intl-listformat/locale-data/nl') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.NL) ? import('@formatjs/intl-pluralrules/locale-data/nl') : Promise.resolve(),
                  ]),
        [LOCALES.PL]: () =>
            this.cache.has(LOCALES.PL)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./pl').then((module: DynamicModule<typeof pl>) => {
                          this.cache.set(LOCALES.PL, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/pl').then((module) => {
                          this.dateUtilsCache.set(LOCALES.PL, module.pl);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.PL) ? import('@formatjs/intl-numberformat/locale-data/pl') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.PL) ? import('@formatjs/intl-listformat/locale-data/pl') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.PL) ? import('@formatjs/intl-pluralrules/locale-data/pl') : Promise.resolve(),
                  ]),
        [LOCALES.PT_BR]: () =>
            this.cache.has(LOCALES.PT_BR)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./pt-BR').then((module: DynamicModule<typeof ptBR>) => {
                          this.cache.set(LOCALES.PT_BR, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/pt-BR').then((module) => {
                          this.dateUtilsCache.set(LOCALES.PT_BR, module.ptBR);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.PT_BR) ? import('@formatjs/intl-numberformat/locale-data/pt') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.PT_BR) ? import('@formatjs/intl-listformat/locale-data/pt') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.PT_BR) ? import('@formatjs/intl-pluralrules/locale-data/pt') : Promise.resolve(),
                  ]),
        [LOCALES.ZH_HANS]: () =>
            this.cache.has(LOCALES.ZH_HANS)
                ? Promise.all([Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./zh-hans').then((module: DynamicModule<typeof zhHans>) => {
                          this.cache.set(LOCALES.ZH_HANS, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/zh-CN').then((module) => {
                          this.dateUtilsCache.set(LOCALES.ZH_HANS, module.zhCN);
                      }),
                      shouldPolyfillNumberFormat(LOCALES.ZH_HANS) ? import('@formatjs/intl-numberformat/locale-data/zh') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.ZH_HANS) ? import('@formatjs/intl-listformat/locale-data/zh') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.ZH_HANS) ? import('@formatjs/intl-pluralrules/locale-data/zh') : Promise.resolve(),
                  ]),
    };

    public static getCurrentLocale() {
        return this.currentLocale;
    }

    /**
     * Returns the date-fns locale to format dates in, which is undefined until that locale's date-fns module has loaded.
     *
     * Callers pass the locale they are rendering with so that a formatted date re-renders when the user switches
     * language. That relies on `load()` populating `dateUtilsCache` before it sets `currentLocale`: the loader promise
     * resolves first, so by the time anything can ask for the new locale its date-fns module is already cached.
     */
    public static getDateFnsLocale(locale: Locale | undefined) {
        return locale ? this.dateUtilsCache.get(locale) : undefined;
    }

    public static load(locale: Locale) {
        if (this.currentLocale === locale) {
            return Promise.resolve();
        }
        const loaderPromise = this.loaders[locale];
        setAreTranslationsLoading(true);

        const localeSpan = getSpan(CONST.TELEMETRY.SPAN_LOCALE.ROOT);

        if (localeSpan) {
            startSpan(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD, {
                name: CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD,
                op: CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD,
                parentSpan: localeSpan,
            });
        }

        // Retry through the shared recovery ladder: a locale chunk that 404s (stale app shell after a
        // deploy) would otherwise reject unhandled and permanently block the boot splash gate in Expensify.tsx.
        return retryDynamicImport(loaderPromise, `${LOCALE_RETRY_KEY_PREFIX}${locale}`)
            .then(() => {
                this.currentLocale = locale;
                // Set the default date-fns locale
                const dateUtilsLocale = this.dateUtilsCache.get(locale);
                if (dateUtilsLocale) {
                    setDefaultOptions({locale: dateUtilsLocale});
                }
                setAreTranslationsLoading(false);

                if (localeSpan) {
                    endSpan(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD);
                }
            })
            .catch((error: unknown) => {
                if (localeSpan) {
                    endSpanWithAttributes(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD, {[CONST.TELEMETRY.ATTRIBUTE_FAILED]: true});
                }

                // Recovery is exhausted: the locale never resolves and the boot splash intentionally stays up —
                // with no translations in memory any screen would render raw translation keys. Report the cause
                // so the stuck splash is diagnosable in Sentry.
                Sentry.captureException(error, {
                    fingerprint: ['locale-load-failed'],
                    extra: {locale},
                });
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
