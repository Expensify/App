/**
 * On the host that serves both products, signing in and out happens on the Expensify Classic pages.
 * They own the browser's Expensify Classic session and the `experience` cookie, and send the user back to New Expensify when that's their product.
 */
import {isSharedProductHost} from '@libs/ExperienceCookie';
import Log from '@libs/Log';
import {getIsOffline} from '@libs/NetworkState';

import CONST from '@src/CONST';

import type {OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignInDuring} from './types';

// Long enough for the tab that signs out to finish its cleanup and reach the Classic sign-out page
const SIGN_OUT_IN_PROGRESS_MS = 30 * 1000;

// The page keeps running until the browser loads the next one, so the first navigation has to stop later ones from replacing it
let isLeavingPage = false;

let isSignInRequested = false;

let isSigningOut = false;

/** Tells the browser's other tabs that a sign out started. Storage access throws in hardened browser configurations. */
function markSignOutStarted() {
    try {
        window.localStorage.setItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT_STARTED_AT, String(Date.now()));
    } catch (error) {
        Log.hmmm('[ClassicSignIn] Unable to tell other tabs that a sign out started', {error});
    }
}

function hasSignOutJustStarted(): boolean {
    try {
        const startedAt = Number(window.localStorage.getItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT_STARTED_AT));
        const elapsed = Date.now() - startedAt;

        // A start in the future means the clock changed, so the mark says nothing about a sign out
        return elapsed >= 0 && elapsed < SIGN_OUT_IN_PROGRESS_MS;
    } catch {
        return false;
    }
}

function replacePage(path: string) {
    isLeavingPage = true;

    // The page is unloading, so the log is sent right away
    Log.info('[ClassicSignIn] Opening an Expensify Classic page', true, {path});
    window.location.replace(`${window.location.origin}/${path}`);
}

function openRequestedSignIn() {
    if (!isSignInRequested || isLeavingPage) {
        return;
    }

    // The Classic sign-in page signs a live Classic session back in, which would undo a sign out that hasn't reached Classic yet.
    // The sign-out page ends that session and then shows the sign-in page.
    const isSignOutInProgress = isSigningOut || hasSignOutJustStarted();
    replacePage(isSignOutInProgress ? CONST.OLDDOT_URLS.SIGN_OUT : CONST.OLDDOT_URLS.SIGN_IN);
}

const openClassicSignIn: OpenClassicSignIn = () => {
    if (!isSharedProductHost()) {
        return () => {};
    }
    isSignInRequested = true;
    openRequestedSignIn();
    return () => {
        isSignInRequested = false;
    };
};

const openClassicSignOutAfter: OpenClassicSignOutAfter = (cleanup) => {
    if (!isSharedProductHost()) {
        return;
    }
    isLeavingPage = true;
    isSigningOut = true;

    // The cleanup signs out every other tab, which would otherwise open the sign-in page while the Classic session is still alive
    markSignOutStarted();

    const openSignOut = () => {
        // The page can't load offline, so the sign-in screen opens it once the connection is back
        if (getIsOffline()) {
            isLeavingPage = false;
            openRequestedSignIn();
            return;
        }
        replacePage(CONST.OLDDOT_URLS.SIGN_OUT);
    };
    cleanup.then(openSignOut, openSignOut);
};

const preventClassicSignInDuring: PreventClassicSignInDuring = (navigation) => {
    isLeavingPage = true;
    navigation.catch((error: unknown) => {
        Log.hmmm('[ClassicSignIn] A sign out failed to open its page', {error});
        isLeavingPage = false;
        openRequestedSignIn();
    });
};

export {openClassicSignIn, openClassicSignOutAfter, preventClassicSignInDuring};
