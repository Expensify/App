/**
 * On the host that serves both products, signing in and out happens on the Expensify Classic pages.
 * They own the browser's Expensify Classic session and the `experience` cookie, and send the user back to New Expensify when that's their product.
 */
import {isSharedProductHost} from '@libs/ExperienceCookie';
import Log from '@libs/Log';
import {getIsOffline} from '@libs/NetworkState';

import CONST from '@src/CONST';

import type {CanOpenClassicSignIn, OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignInDuring} from './types';

// Long enough for the Classic sign-out page to load and end the Classic session, so other tabs don't open the sign-in page before that
const SIGN_OUT_PAGE_LOAD_MS = 30 * 1000;

// Stored while no tab has opened the Classic sign-out page yet, which can take any time, for example while offline
const SIGN_OUT_PENDING = 'pending';

// A tab opens the Classic sign-in page at most this many times within the window, so a sign-in that keeps coming back without a session can't loop
const MAX_SIGN_IN_PAGE_OPENINGS = 2;
const SIGN_IN_PAGE_OPENINGS_WINDOW_MS = 60 * 1000;

// The page keeps running until the browser loads the next one, so the first navigation has to stop later ones from replacing it
let isLeavingPage = false;

let isSignInRequested = false;

let isSigningOut = false;

/** Keeps the state of a sign out for the browser's other tabs and for this tab after a reload. Storage access throws in hardened browser configurations. */
function storeSignOut(value: string) {
    try {
        window.localStorage.setItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT, value);
    } catch (error) {
        Log.hmmm('[ClassicSignIn] Unable to tell other tabs about a sign out', {error});
    }
}

function getStoredSignOut(): string | null {
    try {
        return window.localStorage.getItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT);
    } catch {
        return null;
    }
}

/** Whether a sign out in this tab or any other hasn't opened the Classic sign-out page yet, or opened it too recently to have ended the Classic session */
function isSignOutUnfinished(): boolean {
    if (isSigningOut) {
        return true;
    }
    const signOut = getStoredSignOut();
    if (signOut === SIGN_OUT_PENDING) {
        return true;
    }
    if (!signOut) {
        return false;
    }
    const elapsed = Date.now() - Number(signOut);

    // A time in the future means the clock changed, so the mark says nothing about a sign out
    return elapsed >= 0 && elapsed < SIGN_OUT_PAGE_LOAD_MS;
}

/** The times this tab opened the Classic sign-in page within the window. Session storage keeps them across the page loads of one tab. */
function getRecentSignInPageOpenings(): number[] {
    const now = Date.now();
    const openings = window.sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.CLASSIC_SIGN_IN_OPENED_AT) ?? '';
    return openings
        .split(',')
        .map(Number)
        .filter((openedAt) => {
            const elapsed = now - openedAt;
            return elapsed >= 0 && elapsed < SIGN_IN_PAGE_OPENINGS_WINDOW_MS;
        });
}

function recordSignInPageOpening() {
    try {
        const openings = [...getRecentSignInPageOpenings(), Date.now()];
        window.sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.CLASSIC_SIGN_IN_OPENED_AT, openings.join(','));
    } catch (error) {
        Log.hmmm('[ClassicSignIn] Unable to record that the sign-in page opened', {error});
    }
}

function replacePage(path: string) {
    isLeavingPage = true;

    // The page is unloading, so the log is sent right away
    Log.info('[ClassicSignIn] Opening an Expensify Classic page', true, {path});
    window.location.replace(`${window.location.origin}/${path}`);
}

function openSignInPage() {
    recordSignInPageOpening();
    replacePage(CONST.OLDDOT_URLS.SIGN_IN);
}

function openSignOutPage() {
    // The time starts the window in which sign-in requests open the sign-out page instead.
    // Later openings keep it, so a page that keeps coming back reaches the sign-in page and its opening limit.
    if (isSigningOut || getStoredSignOut() === SIGN_OUT_PENDING) {
        storeSignOut(String(Date.now()));
    }
    replacePage(CONST.OLDDOT_URLS.SIGN_OUT);
}

function openRequestedSignIn() {
    if (!isSignInRequested || isLeavingPage) {
        return;
    }

    // The Classic sign-in page signs a live Classic session back in, which would undo a sign out that hasn't reached Classic yet.
    // The sign-out page ends that session and then shows the sign-in page.
    if (isSignOutUnfinished()) {
        openSignOutPage();
        return;
    }
    openSignInPage();
}

// The browser can restore a page from the back/forward cache with the state it had while leaving, so the sign-in page has to be able to open again
window.addEventListener('pageshow', (event) => {
    if (!event.persisted) {
        return;
    }
    isLeavingPage = false;
    openRequestedSignIn();
});

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

const canOpenClassicSignIn: CanOpenClassicSignIn = () => {
    // A sign-in request during an unfinished sign out opens the sign-out page, which is never limited
    if (isSignOutUnfinished()) {
        return true;
    }

    let openingCount: number;
    try {
        openingCount = getRecentSignInPageOpenings().length;
    } catch {
        // The limit only stops a loop, so without storage the sign-in page can still open
        return true;
    }
    if (openingCount < MAX_SIGN_IN_PAGE_OPENINGS) {
        return true;
    }
    Log.hmmm('[ClassicSignIn] The sign-in page keeps coming back without a session, so the New Expensify sign-in form shows instead', {openingCount});
    return false;
};

const openClassicSignOutAfter: OpenClassicSignOutAfter = (cleanup) => {
    if (!isSharedProductHost()) {
        return;
    }
    isLeavingPage = true;
    isSigningOut = true;

    // The cleanup signs out every other tab, which would otherwise open the sign-in page while the Classic session is still alive.
    // The mark has no time limit, so a reload before the sign-out page opens doesn't forget the sign out.
    storeSignOut(SIGN_OUT_PENDING);

    const openSignOut = () => {
        // The page can't load offline, so the sign-in screen opens it once the connection is back
        if (getIsOffline()) {
            isLeavingPage = false;
            openRequestedSignIn();
            return;
        }
        openSignOutPage();
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

export {canOpenClassicSignIn, openClassicSignIn, openClassicSignOutAfter, preventClassicSignInDuring};
