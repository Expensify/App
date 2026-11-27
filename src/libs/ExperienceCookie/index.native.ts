/**
 * Native apps switch products without the browser, so there is no experience cookie to manage.
 */
import type {ClearExperienceCookie, IsSharedProductHost, ReadExperienceCookie, WriteExperienceCookie} from './types';

const isSharedProductHost: IsSharedProductHost = () => false;

const writeExperienceCookie: WriteExperienceCookie = () => false;

const clearExperienceCookie: ClearExperienceCookie = () => false;

const readExperienceCookie: ReadExperienceCookie = () => undefined;

export {isSharedProductHost, writeExperienceCookie, clearExperienceCookie, readExperienceCookie};
