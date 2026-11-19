import type {Locale} from '@src/CONST/LOCALES';

import {shouldPolyfillListFormat, shouldPolyfillPluralRules} from './nativeLocaleGuards';
import shouldPolyfillDateTimeFormatRange from './shouldPolyfillDateTimeFormatRange';

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

export {shouldPolyfillNumberFormat, shouldPolyfillListFormat, shouldPolyfillPluralRules, shouldPolyfillDateTimeFormatRange};
