import type {Locale} from '@src/CONST/LOCALES';

import {shouldPolyfill as listFormatNeedsLocale} from '@formatjs/intl-listformat/should-polyfill';
import {shouldPolyfill as pluralRulesNeedsLocale} from '@formatjs/intl-pluralrules/should-polyfill';

/**
 * These guards run after the polyfills are installed and answer "does `locale`'s data still need to be
 * loaded?". `polyfill-force` guarantees the constructors exist, so a presence check like
 * `'PluralRules' in Intl` would always say no; formatjs instead checks whether the active
 * implementation supports the specific locale (resolving pt-BR to pt via CLDR).
 */

/**
 * Intl.NumberFormat is only polyfilled on stale-ICU devices (see polyfillNumberFormat) and its data is
 * ~70KB per locale, so skip unless formatjs's `polyfilled` marker is present. We query
 * `supportedLocalesOf` rather than formatjs's `shouldPolyfill`, whose probe for ES2023 rounding
 * options always fails against the installed polyfill and would report every locale as needing data.
 */
function shouldPolyfillNumberFormat(locale: Locale): boolean {
    if (!('polyfilled' in Intl.NumberFormat)) {
        return false;
    }
    return Intl.NumberFormat.supportedLocalesOf([locale]).length === 0;
}

function shouldPolyfillListFormat(locale: Locale): boolean {
    return !!listFormatNeedsLocale(locale);
}

function shouldPolyfillPluralRules(locale: Locale): boolean {
    return !!pluralRulesNeedsLocale(locale);
}

export {shouldPolyfillNumberFormat, shouldPolyfillListFormat, shouldPolyfillPluralRules};
