import type {Locale} from '@src/CONST/LOCALES';

import {DateTimeFormat as FormatjsDateTimeFormat} from '@formatjs/intl-datetimeformat';

/**
 * Only needed where polyfillDateTimeFormatRange installed `formatRange`, which it marks by adding `__addLocaleData` to
 * `Intl.DateTimeFormat`. The engine's own formatter keeps formatting single dates, so this data only feeds ranges.
 * Shared by iOS and Android, which both run on Hermes.
 */
function shouldPolyfillDateTimeFormatRange(locale: Locale): boolean {
    if (!('__addLocaleData' in Intl.DateTimeFormat)) {
        return false;
    }
    return FormatjsDateTimeFormat.supportedLocalesOf([locale]).length === 0;
}

export default shouldPolyfillDateTimeFormatRange;
