/**
 * Native apps never run on the HybridWeb host and switch products through HybridApp, so there is no experience cookie to manage.
 */
import type {ClearExperienceCookie, WriteExperienceCookie} from './types';

const writeExperienceCookie: WriteExperienceCookie = () => false;

const clearExperienceCookie: ClearExperienceCookie = () => false;

export {writeExperienceCookie, clearExperienceCookie};
