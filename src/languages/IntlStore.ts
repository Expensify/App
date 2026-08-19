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
import {shouldPolyfillNumberFormat, shouldPolyfillListFormat, shouldPolyfillPluralRules, shouldPolyfillRelativeTimeFormat} from './shouldPolyfill';

// Mirrors the Onyx key so a no-op write cannot wake a reportAttributes recompute.
let areTranslationsLoadingValue: boolean | undefined;

// This function was added here to avoid circular dependencies
function setAreTranslationsLoading(areTranslationsLoading: boolean) {
    if (areTranslationsLoadingValue === areTranslationsLoading) {
        return;
    }
    areTranslationsLoadingValue = areTranslationsLoading;
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    Onyx.set(ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING, areTranslationsLoading);
}

// Scopes the dynamic-import retry state per locale
const LOCALE_RETRY_KEY_PREFIX = 'locale:';

/**
 * Polyfill locale data is optional: @formatjs falls back to English for that one API when its data is missing, which is
 * a far smaller loss than rejecting the whole `Promise.all` and discarding translations that already downloaded.
 */
function loadOptionalData(dataImport: Promise<unknown> | false, locale: Locale): Promise<void> {
    if (!dataImport) {
        return Promise.resolve();
    }
    return dataImport.then(
        () => undefined,
        (error: unknown) => {
            Log.warn('[IntlStore] Intl polyfill locale data failed to load; that API falls back to English', {locale, error});
        },
    );
}

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
     * `cache.set` runs after `Promise.all`, so `cache.has(locale)` is true only once every settled import has been given
     * its chance to install data. Only the translations chunk can fail the locale, since `loadOptionalData` absorbs the rest.
     */
    private static loaders: Record<Locale, () => Promise<void>> = {
        [LOCALES.DE]: () =>
            this.cache.has(LOCALES.DE)
                ? Promise.resolve()
                : Promise.all([
                      import('./de'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.DE) && import('@formatjs/intl-numberformat/locale-data/de'), LOCALES.DE),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.DE) && import('@formatjs/intl-listformat/locale-data/de'), LOCALES.DE),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.DE) && import('@formatjs/intl-pluralrules/locale-data/de'), LOCALES.DE),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.DE) && import('@formatjs/intl-relativetimeformat/locale-data/de'), LOCALES.DE),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.DE, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof de>)));
                  }),
        [LOCALES.EL]: () =>
            this.cache.has(LOCALES.EL)
                ? Promise.resolve()
                : Promise.all([
                      import('./el'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.EL) && import('@formatjs/intl-numberformat/locale-data/el'), LOCALES.EL),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.EL) && import('@formatjs/intl-listformat/locale-data/el'), LOCALES.EL),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.EL) && import('@formatjs/intl-pluralrules/locale-data/el'), LOCALES.EL),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.EL) && import('@formatjs/intl-relativetimeformat/locale-data/el'), LOCALES.EL),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.EL, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof el>)));
                  }),
        [LOCALES.EN]: () =>
            this.cache.has(LOCALES.EN)
                ? Promise.resolve()
                : Promise.all([
                      import('./en'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.EN) && import('@formatjs/intl-numberformat/locale-data/en'), LOCALES.EN),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.EN) && import('@formatjs/intl-listformat/locale-data/en'), LOCALES.EN),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.EN) && import('@formatjs/intl-pluralrules/locale-data/en'), LOCALES.EN),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.EN) && import('@formatjs/intl-relativetimeformat/locale-data/en'), LOCALES.EN),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.EN, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof en>)));
                  }),
        [LOCALES.ES]: () =>
            this.cache.has(LOCALES.ES)
                ? Promise.resolve()
                : Promise.all([
                      import('./es'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.ES) && import('@formatjs/intl-numberformat/locale-data/es'), LOCALES.ES),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.ES) && import('@formatjs/intl-listformat/locale-data/es'), LOCALES.ES),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.ES) && import('@formatjs/intl-pluralrules/locale-data/es'), LOCALES.ES),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.ES) && import('@formatjs/intl-relativetimeformat/locale-data/es'), LOCALES.ES),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.ES, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof es>)));
                  }),
        [LOCALES.FR]: () =>
            this.cache.has(LOCALES.FR)
                ? Promise.resolve()
                : Promise.all([
                      import('./fr'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.FR) && import('@formatjs/intl-numberformat/locale-data/fr'), LOCALES.FR),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.FR) && import('@formatjs/intl-listformat/locale-data/fr'), LOCALES.FR),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.FR) && import('@formatjs/intl-pluralrules/locale-data/fr'), LOCALES.FR),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.FR) && import('@formatjs/intl-relativetimeformat/locale-data/fr'), LOCALES.FR),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.FR, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof fr>)));
                  }),
        [LOCALES.IT]: () =>
            this.cache.has(LOCALES.IT)
                ? Promise.resolve()
                : Promise.all([
                      import('./it'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.IT) && import('@formatjs/intl-numberformat/locale-data/it'), LOCALES.IT),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.IT) && import('@formatjs/intl-listformat/locale-data/it'), LOCALES.IT),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.IT) && import('@formatjs/intl-pluralrules/locale-data/it'), LOCALES.IT),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.IT) && import('@formatjs/intl-relativetimeformat/locale-data/it'), LOCALES.IT),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.IT, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof it>)));
                  }),
        [LOCALES.JA]: () =>
            this.cache.has(LOCALES.JA)
                ? Promise.resolve()
                : Promise.all([
                      import('./ja'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.JA) && import('@formatjs/intl-numberformat/locale-data/ja'), LOCALES.JA),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.JA) && import('@formatjs/intl-listformat/locale-data/ja'), LOCALES.JA),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.JA) && import('@formatjs/intl-pluralrules/locale-data/ja'), LOCALES.JA),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.JA) && import('@formatjs/intl-relativetimeformat/locale-data/ja'), LOCALES.JA),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.JA, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof ja>)));
                  }),
        [LOCALES.NL]: () =>
            this.cache.has(LOCALES.NL)
                ? Promise.resolve()
                : Promise.all([
                      import('./nl'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.NL) && import('@formatjs/intl-numberformat/locale-data/nl'), LOCALES.NL),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.NL) && import('@formatjs/intl-listformat/locale-data/nl'), LOCALES.NL),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.NL) && import('@formatjs/intl-pluralrules/locale-data/nl'), LOCALES.NL),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.NL) && import('@formatjs/intl-relativetimeformat/locale-data/nl'), LOCALES.NL),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.NL, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof nl>)));
                  }),
        [LOCALES.PL]: () =>
            this.cache.has(LOCALES.PL)
                ? Promise.resolve()
                : Promise.all([
                      import('./pl'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.PL) && import('@formatjs/intl-numberformat/locale-data/pl'), LOCALES.PL),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.PL) && import('@formatjs/intl-listformat/locale-data/pl'), LOCALES.PL),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.PL) && import('@formatjs/intl-pluralrules/locale-data/pl'), LOCALES.PL),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.PL) && import('@formatjs/intl-relativetimeformat/locale-data/pl'), LOCALES.PL),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.PL, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof pl>)));
                  }),
        [LOCALES.PT_BR]: () =>
            this.cache.has(LOCALES.PT_BR)
                ? Promise.resolve()
                : Promise.all([
                      import('./pt-BR'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.PT_BR) && import('@formatjs/intl-numberformat/locale-data/pt'), LOCALES.PT_BR),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.PT_BR) && import('@formatjs/intl-listformat/locale-data/pt'), LOCALES.PT_BR),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.PT_BR) && import('@formatjs/intl-pluralrules/locale-data/pt'), LOCALES.PT_BR),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.PT_BR) && import('@formatjs/intl-relativetimeformat/locale-data/pt'), LOCALES.PT_BR),
                  ]).then(([module]) => {
                      this.cache.set(LOCALES.PT_BR, flattenObject(extractModuleDefaultExport(module as DynamicModule<typeof ptBR>)));
                  }),
        [LOCALES.ZH_HANS]: () =>
            this.cache.has(LOCALES.ZH_HANS)
                ? Promise.resolve()
                : Promise.all([
                      import('./zh-hans'),
                      loadOptionalData(shouldPolyfillNumberFormat(LOCALES.ZH_HANS) && import('@formatjs/intl-numberformat/locale-data/zh'), LOCALES.ZH_HANS),
                      loadOptionalData(shouldPolyfillListFormat(LOCALES.ZH_HANS) && import('@formatjs/intl-listformat/locale-data/zh'), LOCALES.ZH_HANS),
                      loadOptionalData(shouldPolyfillPluralRules(LOCALES.ZH_HANS) && import('@formatjs/intl-pluralrules/locale-data/zh'), LOCALES.ZH_HANS),
                      loadOptionalData(shouldPolyfillRelativeTimeFormat(LOCALES.ZH_HANS) && import('@formatjs/intl-relativetimeformat/locale-data/zh'), LOCALES.ZH_HANS),
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

    /** Test-only cache seed. Skips `load()`'s side effects (Onyx write, telemetry span) that pollute unrelated suites' mocks. Prod uses `load()`. */
    public static seedForTests(locale: Locale, translations: FlatTranslationsObject): void {
        IntlStore.cache.set(locale, translations);
        // Snapshot's `loaded` derives from cache membership, and the splash gate reads the snapshot rather than the Onyx
        // flag, so notifying is enough to clear it. Without this, subscribers stay on the stale pre-seed value forever.
        IntlStore.notifyListeners();
    }

    /** Monotonic token used to discard stale `load()` resolutions when a newer call has superseded them. */
    private static loadToken = 0;

    /**
     * Snapshot exposed to `useSyncExternalStore`. Replaced on every `notifyListeners` so subscribers re-render even when
     * only the cache changed (locale stayed the same). Returning `getCurrentLocale` directly would let React bail on
     * the same-string check and swallow the cache-fill event.
     */
    private static snapshot: {locale: Locale; loaded: boolean; hasAnyTranslations: boolean} = {locale: LOCALES.DEFAULT, loaded: false, hasAnyTranslations: false};

    public static getSnapshot(this: void): {locale: Locale; loaded: boolean; hasAnyTranslations: boolean} {
        return IntlStore.snapshot;
    }

    /** Fresh snapshot identity on every emit, so a content-only change still re-renders. Call only after mutating `currentLocale` or `cache`, never speculatively. */
    private static notifyListeners() {
        // `hasAnyTranslations` is monotonic because the cache never shrinks, which is what the boot splash gate needs.
        IntlStore.snapshot = {locale: IntlStore.currentLocale, loaded: IntlStore.cache.has(IntlStore.currentLocale), hasAnyTranslations: IntlStore.cache.size > 0};
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
                Sentry.captureException(error, {
                    fingerprint: ['locale-load-failed'],
                    extra: {locale},
                });
                // Only stamp the span this call started. A superseded load shares the span id, so it would blame the successor.
                if (localeSpan && IntlStore.loadToken === token) {
                    endSpanWithAttributes(CONST.TELEMETRY.SPAN_LOCALE.TRANSLATIONS_LOAD, {[CONST.TELEMETRY.ATTRIBUTE_FAILED]: true});
                }
                // The splash gate below only lifts on a non-empty cache, so without this fallback the app hangs on the boot splash forever.
                if (IntlStore.loadToken !== token || IntlStore.cache.size > 0 || locale === LOCALES.DEFAULT) {
                    return;
                }
                return retryDynamicImport(IntlStore.loaders[LOCALES.DEFAULT], `${LOCALE_RETRY_KEY_PREFIX}${LOCALES.DEFAULT}`)
                    .then(() => {
                        if (IntlStore.loadToken !== token) {
                            return;
                        }
                        IntlStore.currentLocale = LOCALES.DEFAULT;
                        IntlStore.notifyListeners();
                    })
                    .catch((fallbackError: unknown) => {
                        // Nothing left to render, so the splash stays up by design.
                        Log.warn('[IntlStore] default-locale fallback also failed; boot splash stays up', {locale, fallbackError});
                        Sentry.captureException(fallbackError, {fingerprint: ['locale-load-failed'], extra: {locale: LOCALES.DEFAULT}});
                    });
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
