/**
 * Native apps sign in and out without the browser, so they never open the Expensify Classic pages.
 */
import type {CanOpenClassicSignIn, OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignInDuring} from './types';

const openClassicSignIn: OpenClassicSignIn = () => () => {};

const canOpenClassicSignIn: CanOpenClassicSignIn = () => true;

const openClassicSignOutAfter: OpenClassicSignOutAfter = () => {};

const preventClassicSignInDuring: PreventClassicSignInDuring = () => {};

export {canOpenClassicSignIn, openClassicSignIn, openClassicSignOutAfter, preventClassicSignInDuring};
