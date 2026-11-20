/**
 * On the host that serves both products, signing in and out happens on the Expensify Classic pages.
 * They own the browser's Expensify Classic session and the `experience` cookie, and send the user back to New Expensify when that's their product.
 */
import {isSharedProductHost} from '@libs/ExperienceCookie';

import CONST from '@src/CONST';

import type {OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignIn} from './types';

// The page keeps running until the browser loads the next one, so the first navigation has to stop later ones from replacing it
let isLeavingPage = false;

function replacePage(path: string) {
    window.location.replace(`${window.location.origin}/${path}`);
}

const openClassicSignIn: OpenClassicSignIn = () => {
    if (!isSharedProductHost()) {
        return false;
    }
    if (!isLeavingPage) {
        isLeavingPage = true;
        replacePage(CONST.OLDDOT_URLS.SIGN_IN);
    }
    return true;
};

const openClassicSignOutAfter: OpenClassicSignOutAfter = (cleanup) => {
    if (!isSharedProductHost()) {
        return false;
    }
    isLeavingPage = true;
    const openSignOut = () => replacePage(CONST.OLDDOT_URLS.SIGN_OUT);
    cleanup.then(openSignOut, openSignOut);
    return true;
};

const preventClassicSignIn: PreventClassicSignIn = () => {
    isLeavingPage = true;
};

export {openClassicSignIn, openClassicSignOutAfter, preventClassicSignIn};
