import type CONST from '@src/CONST';

import type DeepValueOf from './DeepValueOf';

/**
 * A label from `CONST.SENTRY_LABEL`. Plain strings are rejected so labels can't carry translated text, IDs or user
 * data, and so native, which drops any label that isn't in `CONST.SENTRY_LABEL`, reports every one of them.
 * See contributingGuides/SENTRY_LABEL.md.
 */
type SentryLabel = DeepValueOf<typeof CONST.SENTRY_LABEL>;

type WithSentryLabel = {
    sentryLabel?: SentryLabel;
};

export default WithSentryLabel;
export type {SentryLabel};
