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

/** Builds a regex alternation that matches exactly one of the given strings. */
function oneOf(values: string[]): string {
    return `(?:${values.map(escapeRegExp).join('|')})`;
}

/**
 * Prefixes and suffixes of labels we build at runtime. The rest of the label isn't checked, so only add one here when
 * the rest can't carry user data. Accessibility labels and test IDs in these formats get through too.
 */
const DYNAMIC_LABEL_PREFIXES = ['Search-Filter-', 'Search-Advanced-Filter-', 'Search-FilterPopupApply-', `${CONST.SENTRY_LABEL.SOCIALS.LINK}-`];
const DYNAMIC_LABEL_SUFFIXES = ['-ClearButton', '-SkippedEmployees'];

/** Matches any string that is not a label from `CONST.SENTRY_LABEL` or a label built in one of the formats above. */
const UNKNOWN_LABEL = new RegExp(`^(?!(?:${oneOf(collectSentryLabels(CONST.SENTRY_LABEL))}|${oneOf(DYNAMIC_LABEL_PREFIXES)}.+|.+${oneOf(DYNAMIC_LABEL_SUFFIXES)})$)`);

/**
 * Sentry on mobile names each tap after a label found on the tapped element or its parents. By default it uses
 * accessibility labels, test IDs or text, which can contain user data like names, emails and amounts.
 * This config makes it use only labels from `CONST.SENTRY_LABEL` (or built in one of the formats above), same as on web.
 */
const touchEventBoundaryProps: TouchEventBoundaryProps = {
    // Use our `sentryLabel` prop as the label.
    labelName: 'sentryLabel',
    // Don't use text as the label.
    extractTextFromChildren: false,
    // Skip elements whose label is not a known label and keep looking at their parents.
    // If no parent has a valid label, the tap is not reported.
    // Sentry checks component names against this too. It works because the views that carry `sentryLabel` have no
    // component name, so adding Sentry's component annotation Babel plugin would make every label get skipped.
    ignoreNames: [UNKNOWN_LABEL],
};

export default touchEventBoundaryProps;
