import Config from 'react-native-config';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import getEnvironment from './getEnvironment';

const ENVIRONMENT_URLS = {
    [CONST.ENVIRONMENT.DEV]: CONST.DEV_NEW_EXPENSIFY_URL + CONFIG.DEV_PORT,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_NEW_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.NEW_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_NEW_EXPENSIFY_URL,
};

const OLDDOT_ENVIRONMENT_URLS = {
    [CONST.ENVIRONMENT.DEV]: CONST.INTERNAL_DEV_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_EXPENSIFY_URL,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.EXPENSIFY_URL,
    [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_EXPENSIFY_URL,
};

const TRAVELDOT_ENVIRONMENT_URLS: Record<string, string> = {
    [CONST.ENVIRONMENT.DEV]: CONST.STAGING_TRAVEL_DOT_URL,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_TRAVEL_DOT_URL,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.TRAVEL_DOT_URL,
    [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_TRAVEL_DOT_URL,
};

const SPOTNANA_ENVIRONMENT_TMC_ID: Record<string, string> = {
    [CONST.ENVIRONMENT.DEV]: CONST.STAGING_SPOTNANA_TMC_ID,
    [CONST.ENVIRONMENT.STAGING]: CONST.STAGING_SPOTNANA_TMC_ID,
    [CONST.ENVIRONMENT.PRODUCTION]: CONST.SPOTNANA_TMC_ID,
    [CONST.ENVIRONMENT.ADHOC]: CONST.STAGING_SPOTNANA_TMC_ID,
};

/**
 * Are we running the app in development?
 */
function isDevelopment(): boolean {
    return (Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV;
}

/**
 * Are we running the app in staging?
 */
function isStaging(): boolean {
    return (Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.STAGING;
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
    return new Promise((resolve) => {
        getEnvironment().then((environment) => resolve(ENVIRONMENT_URLS[environment]));
    });
}

/**
 * Get the corresponding oldDot URL based on the environment we are in
 */
function getOldDotEnvironmentURL(): Promise<string> {
    return getEnvironment().then((environment) => OLDDOT_ENVIRONMENT_URLS[environment]);
}

function getTravelDotEnvironmentURL(): Promise<string> {
    return getEnvironment().then((environment) => TRAVELDOT_ENVIRONMENT_URLS[environment]);
}

function getSpotnanaEnvironmentTMCID(): Promise<string> {
    return getEnvironment().then((environment) => SPOTNANA_ENVIRONMENT_TMC_ID[environment]);
}

export {getEnvironment, isInternalTestBuild, isDevelopment, isStaging, isProduction, getEnvironmentURL, getOldDotEnvironmentURL, getTravelDotEnvironmentURL, getSpotnanaEnvironmentTMCID};
