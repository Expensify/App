import {shouldPolyfillListFormat, shouldPolyfillPluralRules} from './nativeLocaleGuards';
import shouldPolyfillDateTimeFormatRange from './shouldPolyfillDateTimeFormatRange';

/** Android never installs the Intl.NumberFormat polyfill (see IntlPolyfill/index.android.ts), so its locale data is never needed. */
function shouldPolyfillNumberFormat(): boolean {
    return false;
}

export {shouldPolyfillNumberFormat, shouldPolyfillListFormat, shouldPolyfillPluralRules, shouldPolyfillDateTimeFormatRange};
