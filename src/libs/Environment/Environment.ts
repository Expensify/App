import Config from 'react-native-config';
import CONST from '@src/CONST';
import getEnvironment from './getEnvironment';
import type Environment from './getEnvironment/types';

const OLDDOT_ENVIRONMENT_URLS = {
    [CONST.ENVIRONMENT.DEV]: CONST.INTERNAL_DEV_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.EXPENSIFY_URL,
    [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_EXPENSIFY_URL,
};

let cachedDevPort: string | null = null;

/**
 * Get DEV_PORT from CONFIG lazily to avoid circular dependency
 */
function getDevPort(): string {
    if (cachedDevPort !== null) {
        return cachedDevPort;
    }
    // Lazy import to avoid circular dependency - import CONFIG only when needed
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const CONFIG = require('@src/CONFIG').default as {DEV_PORT: string};
    cachedDevPort = CONFIG.DEV_PORT;
    return cachedDevPort;
}

/**
 * Get environment URLs, lazily accessing CONFIG to avoid circular dependency
 */
function getEnvironmentURLs(): Record<string, string> {
    return {
        [CONST.ENVIRONMENT.DEV]: CONST.DEV_NEW_EXPENSIFY_URL + getDevPort(),
        [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_NEW_EXPENSIFY_URL,
        [CONST.ENVIRONMENT.PRODUCTION]: CONST.NEW_EXPENSIFY_URL,
        [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_NEW_EXPENSIFY_URL,
    };
}

/**
 * Are we running the app in development?
 */
function isDevelopment(): boolean {
    return (Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV;
}

/**
 * Are we running the app in production?
 */
function isProduction(): Promise<boolean> {
    return getEnvironment().then((environment) => environment === CONST.ENVIRONMENT.PRODUCTION);
}

/**
 * Are we running an internal test build?
 */
function isInternalTestBuild(): boolean {
    return !!((Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.ADHOC && (Config?.PULL_REQUEST_NUMBER ?? ''));
}

/**
 * Get the URL based on the environment we are in
 */
function getEnvironmentURL(): Promise<string> {
    return getEnvironment().then((environment) => {
        const ENVIRONMENT_URLS = getEnvironmentURLs();
        return ENVIRONMENT_URLS[environment];
    });
}

/**
 * Given the environment get the corresponding oldDot URL
 */
function getOldDotURLFromEnvironment(environment: Environment): string {
    return OLDDOT_ENVIRONMENT_URLS[environment];
}

/**
 * Get the corresponding oldDot URL based on the environment we are in
 */
function getOldDotEnvironmentURL(): Promise<string> {
    return getEnvironment().then((environment) => OLDDOT_ENVIRONMENT_URLS[environment]);
}

export {getEnvironment, isInternalTestBuild, isDevelopment, isProduction, getEnvironmentURL, getOldDotEnvironmentURL, getOldDotURLFromEnvironment};
