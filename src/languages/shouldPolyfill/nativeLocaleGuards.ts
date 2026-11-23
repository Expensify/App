/**
 * These guards run after the polyfills are installed and answer "does `locale`'s data still need to be
 * loaded?". `polyfill-force` guarantees the constructors exist, so a presence check like
 * `'PluralRules' in Intl` would always say no. Lookup checks whether the locale data is loaded,
 * including parent tags such as pt for pt-BR, without matching against FormatJS's full catalogue.
 * Empty locales and missing or broken constructors retain the FormatJS helpers' fallback behavior.
 */
import type {Locale} from '@src/CONST/LOCALES';

import {shouldPolyfill as listFormatNeedsLocale} from '@formatjs/intl-listformat/should-polyfill';
import {shouldPolyfill as pluralRulesNeedsLocale} from '@formatjs/intl-pluralrules/should-polyfill';

function shouldPolyfillListFormat(locale: Locale): boolean {
    if (!locale || !('ListFormat' in Intl)) {
        return !!listFormatNeedsLocale(locale);
    }
    return Intl.ListFormat.supportedLocalesOf([locale], {localeMatcher: 'lookup'}).length === 0;
}

function shouldPolyfillPluralRules(locale: Locale): boolean {
    // Keep FormatJS's constructor bug check, using lookup because native startup always loads English.
    if (!locale || !('PluralRules' in Intl) || new Intl.PluralRules('en', {minimumFractionDigits: 2, localeMatcher: 'lookup'}).select(1) === 'one') {
        return !!pluralRulesNeedsLocale(locale);
    }
    return Intl.PluralRules.supportedLocalesOf([locale], {localeMatcher: 'lookup'}).length === 0;
}

export {shouldPolyfillListFormat, shouldPolyfillPluralRules};
