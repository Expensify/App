import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
/**
 * On the HybridWeb host (expensify.com), a router serves New Expensify or Expensify Classic based on the `experience` cookie.
 * Web-Expensify's ExperienceCookie writes it on every PHP page, but switching to Classic and signing out happen in New Expensify,
 * whose API requests don't carry cookies, so New Expensify writes the same cookie (name, domain, path, flags and lifetime) for those two flows.
 */
import type Environment from '@libs/Environment/getEnvironment/types';
import Log from '@libs/Log';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

import type {ClearExperienceCookie, WriteExperienceCookie} from './types';

const WWW_PREFIX = 'www.';

// Matches the attributes Web-Expensify sets. The cookie is not HttpOnly so the client can read and update it.
const COOKIE_ATTRIBUTES = 'Path=/; Secure; SameSite=Lax';

function getHostnameWithoutWWW(url: string): string {
    const {hostname} = new URL(url);
    return hostname.startsWith(WWW_PREFIX) ? hostname.slice(WWW_PREFIX.length) : hostname;
}

/**
 * Web-Expensify sets the cookie on the parent domain of its own host, for example `.expensify.com` for `www.expensify.com`.
 */
function getExperienceCookieDomain(): string {
    return `.${getHostnameWithoutWWW(CONFIG.EXPENSIFY.EXPENSIFY_URL)}`;
}

function isEnvironment(value: string): value is Environment {
    return Object.values<string>(CONST.ENVIRONMENT).includes(value);
}

/**
 * The HybridWeb host is the Expensify Classic host of the build's environment without `www.`, for example `expensify.com` in production.
 */
function getHybridWebHost(): string | undefined {
    if (!isEnvironment(CONFIG.ENVIRONMENT)) {
        return undefined;
    }
    return getHostnameWithoutWWW(getOldDotURLFromEnvironment(CONFIG.ENVIRONMENT));
}

/**
 * New Expensify on its own hosts (new.expensify.com, dev.new.expensify.com) must keep its current behavior, so the host has to match exactly.
 * The cookie domain check stops a build with a mismatched EXPENSIFY_URL from writing a cookie for a different environment's domain.
 */
function isHybridWebHost(): boolean {
    const hostname = window.location.hostname;
    if (hostname !== getHybridWebHost()) {
        return false;
    }

    const cookieDomain = getExperienceCookieDomain();

    // The leading dot lets the apex host match its own cookie domain, the same way browsers match a cookie's Domain attribute
    if (!`.${hostname}`.endsWith(cookieDomain)) {
        Log.hmmm('[ExperienceCookie] The HybridWeb host does not match the configured cookie domain', {hostname, cookieDomain});
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
    if (!isHybridWebHost()) {
        return false;
    }

    // A host-only cookie with the same name would shadow the shared one for this host, so it's removed first like Web-Expensify does
    deleteCookie();
    document.cookie = `${CONST.EXPERIENCE_COOKIE.NAME}=${value}; Max-Age=${CONST.EXPERIENCE_COOKIE.MAX_AGE_SECONDS}; Domain=${getExperienceCookieDomain()}; ${COOKIE_ATTRIBUTES}`;
    Log.info('[ExperienceCookie] Wrote the experience cookie', false, {value});
    return true;
};

const clearExperienceCookie: ClearExperienceCookie = () => {
    if (!isHybridWebHost()) {
        return false;
    }

    // An experience cookie can exist both host-only and on the shared domain, so both are cleared
    deleteCookie();
    deleteCookie(getExperienceCookieDomain());
    Log.info('[ExperienceCookie] Cleared the experience cookie');
    return true;
};

export {writeExperienceCookie, clearExperienceCookie};
