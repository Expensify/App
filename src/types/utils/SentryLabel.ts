import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type DeepValueOf from './DeepValueOf';

/**
 * Label that names taps in Sentry. On native it becomes part of the tap span name and breadcrumb, on web it is
 * added as the `data-sentry-label` attribute.
 *
 * It must never contain user data (names, emails, amounts, report titles, translated text with user values), so use a
 * value from `CONST.SENTRY_LABEL`, or build one from `CONST.SENTRY_LABEL_PREFIX` / `CONST.SENTRY_LABEL_SUFFIX` and
 * values from the code. Don't cast a string to this type: on native, labels in other formats are dropped.
 */
type SentryLabel = DeepValueOf<typeof CONST.SENTRY_LABEL> | `${ValueOf<typeof CONST.SENTRY_LABEL_PREFIX>}${string}` | `${string}${ValueOf<typeof CONST.SENTRY_LABEL_SUFFIX>}`;

type WithSentryLabel = {
    /** Label that names taps on this element in Sentry. See `SentryLabel`. */
    sentryLabel?: SentryLabel;
};

export default WithSentryLabel;
export type {SentryLabel};
