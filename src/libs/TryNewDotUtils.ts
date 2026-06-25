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

function shouldUseOldApp(tryNewDot: TryNewDot): boolean | undefined {
    if (isLockedToNewApp(tryNewDot)) {
        return false;
    }

    if (isEmptyObject(tryNewDot) || isEmptyObject(tryNewDot.classicRedirect)) {
        return true;
    }

    return tryNewDot.classicRedirect.dismissed;
}

export {hasBeenInNewDot30Days, isLockedToNewApp, isOldAppRedirectBlocked, shouldBlockOldAppExit, shouldHideOldAppRedirect, shouldUseOldApp};
