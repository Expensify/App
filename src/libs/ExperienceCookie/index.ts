/**
 * expensify.com serves New Expensify or Expensify Classic based on the `experience` cookie. Expensify Classic pages keep the cookie in sync
 * with the user's choice, but switching to Classic and signing out happen in New Expensify, whose API requests don't carry cookies,
 * so New Expensify writes the cookie itself for those two flows.
 */
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import type Environment from '@libs/Environment/getEnvironment/types';
import Log from '@libs/Log';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

import type {ClearExperienceCookie, WriteExperienceCookie} from './types';

const WWW_PREFIX = 'www.';

// The server writes the same cookie, so the attributes must match or the browser keeps two copies. It's not HttpOnly so New Expensify can update it.
const COOKIE_ATTRIBUTES = 'Path=/; Secure; SameSite=Lax';

function getHostnameWithoutWWW(url: string): string {
    const {hostname} = new URL(url);
    return hostname.startsWith(WWW_PREFIX) ? hostname.slice(WWW_PREFIX.length) : hostname;
}

/**
 * The cookie is shared by the Expensify Classic host and its subdomains, so its domain is that host without `www.`, for example `.expensify.com`.
 */
function getExperienceCookieDomain(): string {
    return `.${getHostnameWithoutWWW(CONFIG.EXPENSIFY.EXPENSIFY_URL)}`;
}

function isEnvironment(value: string): value is Environment {
    return Object.values<string>(CONST.ENVIRONMENT).includes(value);
}

/**
 * The host that serves both products is the Expensify Classic host of the build's environment without `www.`, for example `expensify.com` in production.
 */
function getSharedProductHost(): string | undefined {
    if (!isEnvironment(CONFIG.ENVIRONMENT)) {
        return undefined;
    }
    return getHostnameWithoutWWW(getOldDotURLFromEnvironment(CONFIG.ENVIRONMENT));
}

/**
 * New Expensify on its own hosts (new.expensify.com, dev.new.expensify.com) doesn't use the cookie, so the host has to match exactly.
 * The cookie domain check stops a build with a mismatched EXPENSIFY_URL from writing a cookie for a different environment's domain.
 */
function isSharedProductHost(): boolean {
    const hostname = window.location.hostname;
    if (hostname !== getSharedProductHost()) {
        return false;
    }

    const cookieDomain = getExperienceCookieDomain();

    // The leading dot lets the apex host match its own cookie domain, the same way browsers match a cookie's Domain attribute
    if (!`.${hostname}`.endsWith(cookieDomain)) {
        Log.hmmm('[ExperienceCookie] The shared product host does not match the configured cookie domain', {hostname, cookieDomain});
        return false;
    }
    return true;
}

/**
 * Deletes a cookie by expiring it. Without a domain this targets the host-only cookie.
 */
function deleteCookie(domain?: string) {
    const domainAttribute = domain ? ` Domain=${domain};` : '';
    document.cookie = `${CONST.EXPERIENCE_COOKIE.NAME}=; Max-Age=0;${domainAttribute} ${COOKIE_ATTRIBUTES}`;
}

const writeExperienceCookie: WriteExperienceCookie = (value) => {
    if (!isSharedProductHost()) {
        return false;
    }

    // A host-only cookie with the same name would shadow the shared one for this host, so it's removed first
    deleteCookie();
    document.cookie = `${CONST.EXPERIENCE_COOKIE.NAME}=${value}; Max-Age=${CONST.EXPERIENCE_COOKIE.MAX_AGE_SECONDS}; Domain=${getExperienceCookieDomain()}; ${COOKIE_ATTRIBUTES}`;
    Log.info('[ExperienceCookie] Wrote the experience cookie', false, {value});
    return true;
};

const clearExperienceCookie: ClearExperienceCookie = () => {
    if (!isSharedProductHost()) {
        return false;
    }

    // An experience cookie can exist both host-only and on the shared domain, so both are cleared
    deleteCookie();
    deleteCookie(getExperienceCookieDomain());
    Log.info('[ExperienceCookie] Cleared the experience cookie');
    return true;
};

export {writeExperienceCookie, clearExperienceCookie};
