/**
 * Native apps sign in and out without the browser, so they never open the Expensify Classic pages.
 */
import type {OpenClassicSignIn, OpenClassicSignOutAfter, PreventClassicSignIn} from './types';

const openClassicSignIn: OpenClassicSignIn = () => false;

const openClassicSignOutAfter: OpenClassicSignOutAfter = () => false;

const preventClassicSignIn: PreventClassicSignIn = () => {};

export {openClassicSignIn, openClassicSignOutAfter, preventClassicSignIn};
