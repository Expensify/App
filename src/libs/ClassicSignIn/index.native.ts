/**
 * Native apps sign in and out without the browser, so they never open the Expensify Classic pages.
 */
import type {CanOpenClassicSignIn, ForgetClassicSignOut, OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignInDuring} from './types';

const openClassicSignIn: OpenClassicSignIn = () => () => {};

const canOpenClassicSignIn: CanOpenClassicSignIn = () => true;

const openClassicSignOutAfter: OpenClassicSignOutAfter = () => {};

const preventClassicSignInDuring: PreventClassicSignInDuring = () => {};

const forgetClassicSignOut: ForgetClassicSignOut = () => {};

export {canOpenClassicSignIn, forgetClassicSignOut, openClassicSignIn, openClassicSignOutAfter, preventClassicSignInDuring};
