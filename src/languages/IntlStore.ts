import extractModuleDefaultExport from '@libs/extractModuleDefaultExport';
import Log from '@libs/Log';
import {endSpan, endSpanWithAttributes, getSpan, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';
import {LOCALES} from '@src/CONST/LOCALES';
import type {Locale} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import type DynamicModule from '@src/types/utils/DynamicModule';
import retryDynamicImport from '@src/utils/retryDynamicImport';

import * as Sentry from '@sentry/react-native';
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
    /** Eagerly seeded to `LOCALES.DEFAULT` (EN). The user's preferred locale loads async via `load()` and replaces this. */
    private static currentLocale: Locale = LOCALES.DEFAULT;

    /** React subscribers via `useSyncExternalStore`. Notified after `currentLocale` mutates so consumers re-render once, instead of two-ticking through Onyx. */
    private static listeners = new Set<() => void>();

    /** No eager EN pre-seed — the splash gate covers cold-start flash and pre-seeding would drag ~150 KB gzip into every bundle. */
    private static cache = new Map<Locale, FlatTranslationsObject>();

    /**
     * Set of loaders for each locale. Can't be DRYed up because dynamic imports must use string literals in metro: https://github.com/facebook/metro/issues/52
     * @formatjs locale data is keyed by the base CLDR tag, so pt covers pt-BR and zh covers zh-hans.
     * `cache.set` runs after `Promise.all`, so `cache.has(locale)` is true only once translations and every required polyfill finished loading.
     */
    private static loaders: Record<Locale, () => Promise<void>> = {
        [LOCALES.DE]: () =>
            this.cache.has(LOCALES.DE)
                ? Promise.resolve()
                : Promise.all([
                      import('./de'),
                      shouldPolyfillNumberFormat(LOCALES.DE) ? import('@formatjs/intl-numberformat/locale-data/de') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.DE) ? import('@formatjs/intl-listformat/locale-data/de') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.DE) ? import('@formatjs/intl-pluralrules/locale-data/de') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.DE, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof de>)));
                  }),
        [LOCALES.EL]: () =>
            this.cache.has(LOCALES.EL)
                ? Promise.resolve()
                : Promise.all([
                      import('./el'),
                      shouldPolyfillNumberFormat(LOCALES.EL) ? import('@formatjs/intl-numberformat/locale-data/el') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.EL) ? import('@formatjs/intl-listformat/locale-data/el') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.EL) ? import('@formatjs/intl-pluralrules/locale-data/el') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.EL, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof el>)));
                  }),
        [LOCALES.EN]: () =>
            this.cache.has(LOCALES.EN)
                ? Promise.resolve()
                : Promise.all([
                      import('./en'),
                      shouldPolyfillNumberFormat(LOCALES.EN) ? import('@formatjs/intl-numberformat/locale-data/en') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.EN) ? import('@formatjs/intl-listformat/locale-data/en') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.EN) ? import('@formatjs/intl-pluralrules/locale-data/en') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.EN, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof en>)));
                  }),
        [LOCALES.ES]: () =>
            this.cache.has(LOCALES.ES)
                ? Promise.resolve()
                : Promise.all([
                      import('./es'),
                      shouldPolyfillNumberFormat(LOCALES.ES) ? import('@formatjs/intl-numberformat/locale-data/es') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.ES) ? import('@formatjs/intl-listformat/locale-data/es') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.ES) ? import('@formatjs/intl-pluralrules/locale-data/es') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.ES, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof es>)));
                  }),
        [LOCALES.FR]: () =>
            this.cache.has(LOCALES.FR)
                ? Promise.resolve()
                : Promise.all([
                      import('./fr'),
                      shouldPolyfillNumberFormat(LOCALES.FR) ? import('@formatjs/intl-numberformat/locale-data/fr') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.FR) ? import('@formatjs/intl-listformat/locale-data/fr') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.FR) ? import('@formatjs/intl-pluralrules/locale-data/fr') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.FR, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof fr>)));
                  }),
        [LOCALES.IT]: () =>
            this.cache.has(LOCALES.IT)
                ? Promise.resolve()
                : Promise.all([
                      import('./it'),
                      shouldPolyfillNumberFormat(LOCALES.IT) ? import('@formatjs/intl-numberformat/locale-data/it') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.IT) ? import('@formatjs/intl-listformat/locale-data/it') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.IT) ? import('@formatjs/intl-pluralrules/locale-data/it') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.IT, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof it>)));
                  }),
        [LOCALES.JA]: () =>
            this.cache.has(LOCALES.JA)
                ? Promise.resolve()
                : Promise.all([
                      import('./ja'),
                      shouldPolyfillNumberFormat(LOCALES.JA) ? import('@formatjs/intl-numberformat/locale-data/ja') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.JA) ? import('@formatjs/intl-listformat/locale-data/ja') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.JA) ? import('@formatjs/intl-pluralrules/locale-data/ja') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.JA, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof ja>)));
                  }),
        [LOCALES.NL]: () =>
            this.cache.has(LOCALES.NL)
                ? Promise.resolve()
                : Promise.all([
                      import('./nl'),
                      shouldPolyfillNumberFormat(LOCALES.NL) ? import('@formatjs/intl-numberformat/locale-data/nl') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.NL) ? import('@formatjs/intl-listformat/locale-data/nl') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.NL) ? import('@formatjs/intl-pluralrules/locale-data/nl') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.NL, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof nl>)));
                  }),
        [LOCALES.PL]: () =>
            this.cache.has(LOCALES.PL)
                ? Promise.resolve()
                : Promise.all([
                      import('./pl'),
                      shouldPolyfillNumberFormat(LOCALES.PL) ? import('@formatjs/intl-numberformat/locale-data/pl') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.PL) ? import('@formatjs/intl-listformat/locale-data/pl') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.PL) ? import('@formatjs/intl-pluralrules/locale-data/pl') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.PL, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof pl>)));
                  }),
        [LOCALES.PT_BR]: () =>
            this.cache.has(LOCALES.PT_BR)
                ? Promise.resolve()
                : Promise.all([
                      import('./pt-BR'),
                      shouldPolyfillNumberFormat(LOCALES.PT_BR) ? import('@formatjs/intl-numberformat/locale-data/pt') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.PT_BR) ? import('@formatjs/intl-listformat/locale-data/pt') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.PT_BR) ? import('@formatjs/intl-pluralrules/locale-data/pt') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.PT_BR, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof ptBR>)));
                  }),
        [LOCALES.ZH_HANS]: () =>
            this.cache.has(LOCALES.ZH_HANS)
                ? Promise.resolve()
                : Promise.all([
                      import('./zh-hans'),
                      shouldPolyfillNumberFormat(LOCALES.ZH_HANS) ? import('@formatjs/intl-numberformat/locale-data/zh') : Promise.resolve(),
                      shouldPolyfillListFormat(LOCALES.ZH_HANS) ? import('@formatjs/intl-listformat/locale-data/zh') : Promise.resolve(),
                      shouldPolyfillPluralRules(LOCALES.ZH_HANS) ? import('@formatjs/intl-pluralrules/locale-data/zh') : Promise.resolve(),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.ZH_HANS, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof zhHans>)));
                  }),
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

    /** True once `load(locale)` has populated the translations cache. Consumers use this to distinguish "not loaded yet" from a genuinely-missing translation. */
    public static hasLocale(this: void, locale: Locale): boolean {
        return IntlStore.cache.has(locale);
    }

    /** Test-only cache seed — skips `load()`'s side effects (Onyx write, telemetry span, date-fns default) that pollute unrelated suites' mocks. Prod uses `load()`. */
    public static seedForTests(locale: Locale, translations: FlatTranslationsObject): void {
        IntlStore.cache.set(locale, translations);
        // Snapshot's `loaded` derives from cache membership. Without notifying, subscribers stay on the stale pre-seed value forever.
        IntlStore.notifyListeners();
    }

    /** Monotonic token used to discard stale `load()` resolutions when a newer call has superseded them. */
    private static loadToken = 0;

    /**
     * Snapshot exposed to `useSyncExternalStore`. Replaced on every `notifyListeners` so subscribers re-render even when
     * only the cache changed (locale stayed the same). Returning `getCurrentLocale` directly would let React bail on
     * the same-string check and swallow the cache-fill event.
     */
    private static snapshot: {locale: Locale; loaded: boolean} = {locale: LOCALES.DEFAULT, loaded: false};

    public static getSnapshot(this: void): {locale: Locale; loaded: boolean} {
        return IntlStore.snapshot;
    }

    private static notifyListeners() {
        const nextLoaded = IntlStore.cache.has(IntlStore.currentLocale);
        // Skip when nothing derived changed, so a same-locale/same-loaded notify (fast-path re-entry, redundant load call) does not trigger unnecessary re-renders across every LocaleContext consumer.
        if (IntlStore.snapshot.locale === IntlStore.currentLocale && IntlStore.snapshot.loaded === nextLoaded) {
            return;
        }
        IntlStore.snapshot = {locale: IntlStore.currentLocale, loaded: nextLoaded};
        for (const listener of IntlStore.listeners) {
            listener();
        }
    }

    public static load(locale: Locale) {
        if (IntlStore.currentLocale === locale && IntlStore.cache.has(locale)) {
            // Bump the token so any in-flight earlier load() is invalidated; otherwise its `.then` would commit a stale locale.
            IntlStore.loadToken++;
            // Reset the flag here — the discarded load's `.then` will bail on the token check before reaching its own reset.
            setAreTranslationsLoading(false);
            // Notify in case the snapshot's `loaded` transitioned since the last emission (e.g. seedForTests populated the cache without going through this notify path).
            IntlStore.notifyListeners();
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

        // Retry through the shared recovery ladder: a locale chunk that 404s (stale app shell after a
        // deploy) would otherwise reject unhandled and permanently block the boot splash gate in Expensify.tsx.
        return retryDynamicImport(loaderPromise, `${LOCALE_RETRY_KEY_PREFIX}${locale}`)
            .then(() => {
                // A newer `load()` call superseded this one — let it commit instead.
                if (IntlStore.loadToken !== token) {
                    return;
                }
                IntlStore.currentLocale = locale;
                IntlStore.notifyListeners();
                if (localeSpan) {
                    endSpan(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD);
                }
            })
            .catch((error: unknown) => {
                Log.warn('[IntlStore] locale chunk failed to load', {locale, error});
                // Recovery exhausted: locale never resolves, boot splash intentionally stays up — Sentry surfaces the cause so the stuck splash is diagnosable.
                Sentry.captureException(error, {
                    fingerprint: ['locale-load-failed'],
                    extra: {locale},
                });
                if (localeSpan) {
                    // Stamp failure so the Sentry `failed:true` filter can separate stuck-splash incidents from healthy loads.
                    endSpanWithAttributes(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD, {[CONST.TELEMETRY.ATTRIBUTE_FAILED]: true});
                }
            })
            .finally(() => {
                // At least one fully completed locale required, else a rejected first-load would open the splash to raw path strings.
                if (IntlStore.loadToken !== token || IntlStore.cache.size === 0) {
                    return;
                }
                setAreTranslationsLoading(false);
            });
    }

    public static get<TPath extends TranslationPaths>(key: TPath, locale?: Locale) {
        const localeToUse = locale && IntlStore.cache.has(locale) ? locale : IntlStore.currentLocale;
        const translations = IntlStore.cache.get(localeToUse);
        return translations?.[key] ?? null;
    }
}

export default IntlStore;
