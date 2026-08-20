/**
 * Kept in their own module so `IntlStore` can drop them without importing `DateUtils`, which imports `Localize`,
 * which imports `IntlStore`.
 *
 * Only a cache over a polyfilled API can go stale: `@formatjs` installs locale data asynchronously, so a formatter
 * built before its data arrived stays English. `Intl.DateTimeFormat` is native on both engines, so it cannot.
 */
import type {Locale} from '@src/CONST/LOCALES';

/** `Intl.DateTimeFormat` holds 10-50 KB of ICU state per entry, so this one is bounded; the relative-time key space is the shipped locales. */
const INTL_FORMAT_CACHE_MAX_SIZE = 256;

const intlDateTimeFormatCache = new Map<string, Intl.DateTimeFormat | null>();
const relativeTimeFormatCache = new Map<Locale, Intl.RelativeTimeFormat | null>();

/** Caches holding values *derived* from Intl register here, so one clear reaches everything built against stale data. */
const derivedCacheResets = new Set<() => void>();

function registerDerivedIntlCache(reset: () => void): void {
    derivedCacheResets.add(reset);
}

/** Only failures: dropping working formatters rebuilds every on-screen one. */
function dropFailedDateTimeFormatters(): void {
    for (const [key, formatter] of intlDateTimeFormatCache) {
        if (formatter === null) {
            intlDateTimeFormatCache.delete(key);
        }
    }
}

function refreshIntlFormatterCaches(): void {
    dropFailedDateTimeFormatters();
    relativeTimeFormatCache.clear();
    for (const reset of derivedCacheResets) {
        reset();
    }
}

/** Full reset, for tests that stub `Intl` and need the constructor to actually run. */
function clearIntlFormatterCaches(): void {
    intlDateTimeFormatCache.clear();
    relativeTimeFormatCache.clear();
    for (const reset of derivedCacheResets) {
        reset();
    }
}

export {INTL_FORMAT_CACHE_MAX_SIZE, intlDateTimeFormatCache, relativeTimeFormatCache, registerDerivedIntlCache, refreshIntlFormatterCaches, clearIntlFormatterCaches};
