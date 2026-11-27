/**
 * Native apps switch products without the browser, so there is no experience cookie to manage.
 */
import type {ClearExperienceCookie, IsSharedProductHost, ReadExperienceCookie, WriteExperienceCookie} from './types';

const writeExperienceCookie: WriteExperienceCookie = () => false;

const clearExperienceCookie: ClearExperienceCookie = () => false;

const readExperienceCookie: ReadExperienceCookie = () => undefined;

const isSharedProductHost: IsSharedProductHost = () => false;

export {writeExperienceCookie, clearExperienceCookie, readExperienceCookie, isSharedProductHost};
