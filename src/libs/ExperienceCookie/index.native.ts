/**
 * Native apps switch products without the browser, so there is no experience cookie to manage.
 */
import type {ClearExperienceCookie, IsSharedProductHost, WriteExperienceCookie} from './types';

const writeExperienceCookie: WriteExperienceCookie = () => false;

const clearExperienceCookie: ClearExperienceCookie = () => false;

const isSharedProductHost: IsSharedProductHost = () => false;

export {writeExperienceCookie, clearExperienceCookie, isSharedProductHost};
