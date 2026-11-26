/**
 * Native apps switch products without the browser, so there is no experience cookie to manage.
 */
import type {ClearExperienceCookie, IsSharedProductHost, WriteExperienceCookie} from './types';

const isSharedProductHost: IsSharedProductHost = () => false;

const writeExperienceCookie: WriteExperienceCookie = () => false;

const clearExperienceCookie: ClearExperienceCookie = () => false;

export {isSharedProductHost, writeExperienceCookie, clearExperienceCookie};
