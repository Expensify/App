import extractModuleDefaultExport from '@libs/extractModuleDefaultExport';
import Log from '@libs/Log';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import type DynamicModule from '@src/types/utils/DynamicModule';

import type {Locale as DateUtilsLocale} from 'date-fns';

import {setDefaultOptions} from 'date-fns';
import Onyx from 'react-native-onyx';

import type de from './de';
import type es from './es';
import type fr from './fr';
import type it from './it';
import type ja from './ja';
import type nl from './nl';
import type pl from './pl';
import type ptBR from './pt-BR';
import type {FlatTranslationsObject, TranslationPaths} from './types';
import type zhHans from './zh-hans';

import enTranslations from './en';
import flattenObject from './flattenObject';

// This function was added here to avoid circular dependencies
function setAreTranslationsLoading(areTranslationsLoading: boolean) {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    Onyx.set(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING, areTranslationsLoading);
}

class IntlStore {
    /** Eagerly seeded to `LOCALES.DEFAULT` (EN). The user's preferred locale loads async via `load()` and replaces this. */
    private static currentLocale: Locale = LOCALES.DEFAULT;

    /** React subscribers via `useSyncExternalStore`. Notified after `currentLocale` mutates so consumers re-render once, instead of two-ticking through Onyx. */
    private static listeners = new Set<() => void>();

    /** Pre-seeded with EN so `translate('en', key)` resolves synchronously from module load (no cold-start path-string degradation). */
    private static cache = new Map<Locale, FlatTranslationsObject>([[LOCALES.EN, flattenObject(enTranslations)]]);

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
        [LOCALES.DE]: () =>
            this.cache.has(LOCALES.DE) && this.dateUtilsCache.has(LOCALES.DE)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./de').then((module: DynamicModule<typeof de>) => {
                          this.cache.set(LOCALES.DE, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/de').then((module) => {
                          this.dateUtilsCache.set(LOCALES.DE, module.de);
                      }),
                  ]),
        [LOCALES.EN]: () =>
            this.cache.has(LOCALES.EN) && this.dateUtilsCache.has(LOCALES.EN)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      // Translations are pre-seeded above; only the date-fns chunk needs to load.
                      Promise.resolve(),
                      import('date-fns/locale/en-GB').then((module) => {
                          this.dateUtilsCache.set(LOCALES.EN, module.enGB);
                      }),
                  ]),
        [LOCALES.ES]: () =>
            this.cache.has(LOCALES.ES) && this.dateUtilsCache.has(LOCALES.ES)
                ? Promise.all([Promise.resolve(), Promise.resolve()])
                : Promise.all([
                      import('./es').then((module: DynamicModule<typeof es>) => {
                          this.cache.set(LOCALES.ES, flattenObject(extractModuleDefaultExport(module)));
                      }),
                      import('date-fns/locale/es').then((module) => {
                          this.dateUtilsCache.set(LOCALES.ES, module.es);
                      }),
                  ]),
        [LOCALES.FR]: () =>
            this.cache.has(LOCALES.FR) && this.dateUtilsCache.has(LOCALES.FR)
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
            this.cache.has(LOCALES.IT) && this.dateUtilsCache.has(LOCALES.IT)
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
            this.cache.has(LOCALES.JA) && this.dateUtilsCache.has(LOCALES.JA)
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
            this.cache.has(LOCALES.NL) && this.dateUtilsCache.has(LOCALES.NL)
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
            this.cache.has(LOCALES.PL) && this.dateUtilsCache.has(LOCALES.PL)
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
            this.cache.has(LOCALES.PT_BR) && this.dateUtilsCache.has(LOCALES.PT_BR)
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
            this.cache.has(LOCALES.ZH_HANS) && this.dateUtilsCache.has(LOCALES.ZH_HANS)
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

    /**
     * `useSyncExternalStore` calls these detached from the class. `this: void` enforces the contract in
     * types; bodies reference `IntlStore.x` (not `this.x`) to enforce it at runtime.
     */
    public static subscribe(this: void, listener: () => void): () => void {
        IntlStore.listeners.add(listener);
        return () => {
            IntlStore.listeners.delete(listener);
        };
    }

    public static getCurrentLocale(this: void): Locale {
        return IntlStore.currentLocale;
    }

    /** Returns the date-fns locale for use in per-call `{locale}` options — undefined if the chunk hasn't loaded yet. */
    public static getDateFnsLocale(this: void, locale: Locale): DateUtilsLocale | undefined {
        return IntlStore.dateUtilsCache.get(locale);
    }

    /** Monotonic token used to discard stale `load()` resolutions when a newer call has superseded them. */
    private static loadToken = 0;

    /** Bumped on every `notifyListeners` so `useSyncExternalStore` subscribers can re-render on non-identity mutations (e.g. dateUtilsCache fill) that a locale snapshot would `Object.is`-bail. */
    private static version = 0;

    public static getSnapshotVersion(this: void): number {
        return IntlStore.version;
    }

    private static notifyListeners() {
        IntlStore.version++;
        for (const listener of IntlStore.listeners) {
            listener();
        }
    }

    public static load(locale: Locale) {
        // Cold-start EN has translations seeded but the en-GB date-fns chunk + Onyx loading flag still need to fire.
        if (IntlStore.currentLocale === locale && IntlStore.dateUtilsCache.has(locale)) {
            // Bump the token so any in-flight earlier load() is invalidated; otherwise its `.then` would commit a stale locale.
            IntlStore.loadToken++;
            // Reset the flag here — the discarded load's `.then` will bail on the token check before reaching its own reset.
            setAreTranslationsLoading(false);
            return Promise.resolve();
        }
        const loaderPromise = IntlStore.loaders[locale];
        const token = ++IntlStore.loadToken;
        setAreTranslationsLoading(true);

        const localeSpan = getSpan(CONST.TELEMETRY.SPAN_LOCALE.ROOT);

        if (localeSpan) {
            startSpan(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD, {
                name: CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD,
                op: CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD,
                parentSpan: localeSpan,
            });
        }

        return loaderPromise()
            .then(() => {
                // A newer `load()` call superseded this one — let it commit instead.
                if (IntlStore.loadToken !== token) {
                    return;
                }
                IntlStore.currentLocale = locale;
                const dateUtilsLocale = IntlStore.dateUtilsCache.get(locale);
                if (dateUtilsLocale) {
                    setDefaultOptions({locale: dateUtilsLocale});
                }
                IntlStore.notifyListeners();
            })
            .catch((error: unknown) => {
                Log.warn('[IntlStore] locale chunk failed to load', {locale, error});
            })
            .finally(() => {
                if (IntlStore.loadToken === token) {
                    setAreTranslationsLoading(false);
                }
                if (!localeSpan) {
                    return;
                }
                endSpan(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD);
            });
    }

    public static get<TPath extends TranslationPaths>(key: TPath, locale?: Locale) {
        const localeToUse = locale && IntlStore.cache.has(locale) ? locale : IntlStore.currentLocale;
        const translations = IntlStore.cache.get(localeToUse);
        return translations?.[key] ?? null;
    }
}

export default IntlStore;
