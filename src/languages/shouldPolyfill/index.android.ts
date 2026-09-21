import type {Locale} from '@src/CONST/LOCALES';

import {shouldPolyfill as listFormatNeedsLocale} from '@formatjs/intl-listformat/should-polyfill';
import {shouldPolyfill as pluralRulesNeedsLocale} from '@formatjs/intl-pluralrules/should-polyfill';

/**
 * These guards run after the polyfills are installed and answer "does `locale`'s data still need to be
 * loaded?". `polyfill-force` guarantees the constructors exist, so a presence check like
 * `'PluralRules' in Intl` would always say no; formatjs instead checks whether the active
 * implementation supports the specific locale (resolving pt-BR to pt via CLDR).
 */

/** Android never installs the Intl.NumberFormat polyfill (see IntlPolyfill/index.android.ts), so its locale data is never needed. */
function shouldPolyfillNumberFormat(): boolean {
    return false;
}

function shouldPolyfillListFormat(locale: Locale): boolean {
    return !!listFormatNeedsLocale(locale);
}

function shouldPolyfillPluralRules(locale: Locale): boolean {
    return !!pluralRulesNeedsLocale(locale);
}

export {shouldPolyfillNumberFormat, shouldPolyfillListFormat, shouldPolyfillPluralRules};
