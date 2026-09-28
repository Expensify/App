import type {DismissedProductTraining} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {fromZonedTime} from 'date-fns-tz';

function isProductTrainingElementDismissed(elementName: keyof DismissedProductTraining, dismissedProductTraining: OnyxEntry<DismissedProductTraining>) {
    return typeof dismissedProductTraining?.[elementName] === 'string' ? !!dismissedProductTraining?.[elementName] : !!dismissedProductTraining?.[elementName]?.timestamp;
}

/**
 * Whether a dismissal is older than the given window, i.e. the element is allowed to be shown again.
 * Returns false when the element was never dismissed, so callers pair this with isProductTrainingElementDismissed.
 */
function hasDismissalExpired(elementName: keyof DismissedProductTraining, dismissedProductTraining: OnyxEntry<DismissedProductTraining>, windowInMilliseconds: number) {
    const element = dismissedProductTraining?.[elementName];
    // Legacy entries stored only a dismissal marker with no timestamp, so there is no window to measure against.
    if (typeof element === 'string' || !element?.timestamp) {
        return false;
    }

    // Timestamps are stored as UTC DB time ("2026-08-30 09:15:42.123"), which Date cannot parse as UTC on its own.
    const dismissedAt = fromZonedTime(element.timestamp, 'UTC').valueOf();
    if (Number.isNaN(dismissedAt)) {
        return false;
    }

    return Date.now() - dismissedAt > windowInMilliseconds;
}

export default isProductTrainingElementDismissed;
export {hasDismissalExpired};
