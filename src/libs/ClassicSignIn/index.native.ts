/**
 * Native apps sign in and out without the browser, so they never open the Expensify Classic pages.
 */
import type {OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignInDuring} from './types';

const openClassicSignIn: OpenClassicSignIn = () => () => {};

const openClassicSignOutAfter: OpenClassicSignOutAfter = () => {};

const preventClassicSignInDuring: PreventClassicSignInDuring = () => {};

export {openClassicSignIn, openClassicSignOutAfter, preventClassicSignInDuring};
