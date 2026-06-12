import {differenceInDays} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import type {TryNewDot} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const NEW_DOT_MIN_DAYS_BEFORE_HIDING_CLASSIC_REDIRECT = 30;

function isLockedToNewApp(tryNewDot: OnyxEntry<TryNewDot>): boolean {
    return tryNewDot?.isLockedToNewApp === true;
}

function hasBeenInNewDot30Days(tryNewDot: OnyxEntry<TryNewDot>): boolean {
    const classicRedirect = tryNewDot?.classicRedirect;
    if (!classicRedirect || classicRedirect.dismissed !== false || !classicRedirect.timestamp) {
        return false;
    }

    const daysSinceNudge = differenceInDays(new Date(), new Date(classicRedirect.timestamp));
    return daysSinceNudge >= NEW_DOT_MIN_DAYS_BEFORE_HIDING_CLASSIC_REDIRECT;
}

function shouldBlockOldAppExit(tryNewDot: OnyxEntry<TryNewDot>, isLoadingTryNewDot: boolean, shouldSetNVP: boolean): boolean {
    if (isLockedToNewApp(tryNewDot)) {
        return true;
    }

    return shouldSetNVP && isLoadingTryNewDot;
}

function isOldAppRedirectBlocked(tryNewDot: OnyxEntry<TryNewDot>, shouldRespectMobileLock: boolean): boolean {
    return tryNewDot?.classicRedirect?.isLockedToNewDot === true || hasBeenInNewDot30Days(tryNewDot) || (shouldRespectMobileLock && isLockedToNewApp(tryNewDot));
}

function shouldHideOldAppRedirect(tryNewDot: OnyxEntry<TryNewDot>, isLoadingTryNewDot: boolean, shouldRespectMobileLock: boolean): boolean {
    return (shouldRespectMobileLock && isLoadingTryNewDot) || isOldAppRedirectBlocked(tryNewDot, shouldRespectMobileLock);
}

/**
 * Determines whether to hide the "Switch to Expensify Classic" button on the Troubleshoot page.
 * Unlike the generic shouldHideOldAppRedirect, this does NOT suppress the button just because
 * the 30-day nudge has gone stale — the Troubleshoot page is a manual escape hatch that should
 * remain available for users who are not locked to NewDot.
 */
function shouldHideTroubleshootOldAppRedirect(tryNewDot: OnyxEntry<TryNewDot>, isLoadingTryNewDot: boolean, shouldRespectMobileLock: boolean): boolean {
    if (shouldRespectMobileLock && isLoadingTryNewDot) {
        return true;
    }
    // Only hide for users who are genuinely locked to NewDot, not because the nudge aged out.
    return tryNewDot?.classicRedirect?.isLockedToNewDot === true || (shouldRespectMobileLock && isLockedToNewApp(tryNewDot));
}

function shouldUseOldApp(tryNewDot: TryNewDot): boolean | undefined {
    if (isLockedToNewApp(tryNewDot)) {
        return false;
    }

    if (isEmptyObject(tryNewDot) || isEmptyObject(tryNewDot.classicRedirect)) {
        return true;
    }

    return tryNewDot.classicRedirect.dismissed;
}

export {hasBeenInNewDot30Days, isLockedToNewApp, isOldAppRedirectBlocked, shouldBlockOldAppExit, shouldHideOldAppRedirect, shouldHideTroubleshootOldAppRedirect, shouldUseOldApp};
