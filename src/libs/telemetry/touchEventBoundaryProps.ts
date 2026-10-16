import CONST from '@src/CONST';

import type {TouchEventBoundary} from '@sentry/react-native';
import type {ComponentProps} from 'react';

import escapeRegExp from 'lodash/escapeRegExp';

type TouchEventBoundaryProps = ComponentProps<typeof TouchEventBoundary>;

/** Returns all label strings from the nested `CONST.SENTRY_LABEL` object. */
function collectSentryLabels(value: unknown): string[] {
    if (typeof value === 'string') {
        return [value];
    }
    if (typeof value !== 'object' || value === null) {
        return [];
    }
    return Object.values(value).flatMap(collectSentryLabels);
}

/** Matches any string that is not a label from `CONST.SENTRY_LABEL`. */
const UNKNOWN_LABEL = new RegExp(`^(?!(?:${collectSentryLabels(CONST.SENTRY_LABEL).map(escapeRegExp).join('|')})$)`);

/**
 * Sentry on mobile names each tap after a label found on the tapped element or its parents. By default it uses
 * accessibility labels, test IDs or text, which can contain user data like names, emails and amounts.
 * This config makes it use only labels from `CONST.SENTRY_LABEL`, same as on web.
 */
const touchEventBoundaryProps: TouchEventBoundaryProps = {
    // Use our `sentryLabel` prop as the label.
    labelName: 'sentryLabel',
    // Don't use text as the label.
    extractTextFromChildren: false,
    // Skip elements whose label is not in `CONST.SENTRY_LABEL` and keep looking at their parents.
    // If no parent has a valid label, the tap is not reported.
    // Sentry checks component names against this too. It works because the views that carry `sentryLabel` have no
    // component name, so adding Sentry's component annotation Babel plugin would make every label get skipped.
    ignoreNames: [UNKNOWN_LABEL],
};

export default touchEventBoundaryProps;
