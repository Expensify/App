import type {OnyxEntry} from 'react-native-onyx';
import type {TryNewDot} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function isLockedToNewApp(tryNewDot: OnyxEntry<TryNewDot>): boolean {
    return tryNewDot?.isLockedToNewApp === true;
}

function shouldBlockOldAppExit(tryNewDot: OnyxEntry<TryNewDot>, isLoadingTryNewDot: boolean, shouldSetNVP: boolean): boolean {
    if (isLockedToNewApp(tryNewDot)) {
        return true;
    }

    return shouldSetNVP && isLoadingTryNewDot;
}

function isOldAppRedirectBlocked(tryNewDot: OnyxEntry<TryNewDot>, shouldRespectMobileLock: boolean): boolean {
    return tryNewDot?.classicRedirect?.isLockedToNewDot === true || (shouldRespectMobileLock && isLockedToNewApp(tryNewDot));
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

export {isLockedToNewApp, isOldAppRedirectBlocked, shouldBlockOldAppExit, shouldHideOldAppRedirect, shouldUseOldApp};
