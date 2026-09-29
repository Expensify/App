import type {Locale} from '@src/CONST/LOCALES';

/**
 * These guards run after the polyfills are installed and answer "does `locale`'s data still need to be
 * loaded?". A presence check like `'NumberFormat' in Intl` would always say no once a polyfill has
 * installed the constructor, so we ask `supportedLocalesOf` instead (which also resolves pt-BR to pt
 * via CLDR).
 */

/**
 * Intl.NumberFormat is the only Intl polyfill web installs, and only when the browser's currency data
 * is stale (see polyfillNumberFormat). Short-circuit on formatjs's `polyfilled` marker to avoid
 * pulling in ~70KB of locale data when the native implementation is active.
 */
function shouldPolyfillNumberFormat(locale: Locale): boolean {
    if (!('polyfilled' in Intl.NumberFormat)) {
        return false;
    }
    return Intl.NumberFormat.supportedLocalesOf([locale]).length === 0;
}

/** Web never installs the Intl.ListFormat or Intl.PluralRules polyfills, so their data is never needed. */
const shouldPolyfillListFormat: (locale: Locale) => boolean = () => false;

const shouldPolyfillPluralRules: (locale: Locale) => boolean = () => false;

export {shouldPolyfillNumberFormat, shouldPolyfillListFormat, shouldPolyfillPluralRules};
