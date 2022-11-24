import lodashGet from 'lodash/get';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import getPlatform from './libs/getPlatform/index';
import * as Url from './libs/Url';
import CONST from './CONST';

// Set default values to contributor friendly values to make development work out of the box without an .env file
const ENVIRONMENT = lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);
const newExpensifyURL = Url.addTrailingForwardSlash(lodashGet(Config, 'NEW_EXPENSIFY_URL', 'https://new.expensify.com/'));
const expensifyURL = Url.addTrailingForwardSlash(lodashGet(Config, 'EXPENSIFY_URL', 'https://www.expensify.com/'));
const stagingExpensifyURL = Url.addTrailingForwardSlash(lodashGet(Config, 'STAGING_EXPENSIFY_URL', 'https://staging.expensify.com/'));
const stagingSecureExpensifyUrl = Url.addTrailingForwardSlash(lodashGet(Config, 'STAGING_SECURE_EXPENSIFY_URL', 'https://staging-secure.expensify.com/'));
const ngrokURL = Url.addTrailingForwardSlash(lodashGet(Config, 'NGROK_URL', ''));
const secureNgrokURL = Url.addTrailingForwardSlash(lodashGet(Config, 'SECURE_NGROK_URL', ''));
const secureExpensifyUrl = Url.addTrailingForwardSlash(lodashGet(
    Config, 'SECURE_EXPENSIFY_URL', 'https://secure.expensify.com/',
));
const useNgrok = lodashGet(Config, 'USE_NGROK', 'false') === 'true';
const useWebProxy = lodashGet(Config, 'USE_WEB_PROXY', 'true') === 'true';
const expensifyComWithProxy = getPlatform() === 'web' && useWebProxy ? '/' : expensifyURL;

// Throw errors on dev if config variables are not set correctly
if (ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
    if (!useNgrok && expensifyURL.includes('dev') && !secureExpensifyUrl.includes('dev')) {
        throw new Error('SECURE_EXPENSIFY_URL must end with .dev when EXPENSIFY_URL ends with .dev');
    }

    if (useNgrok && !secureNgrokURL) {
        throw new Error('SECURE_NGROK_URL must be defined in .env when USE_NGROK=true');
    }
}

const secureURLRoot = useNgrok && secureNgrokURL ? secureNgrokURL : secureExpensifyUrl;

// Ngrok helps us avoid many of our cross-domain issues with connecting to our API
// and is required for viewing images on mobile and for developing on android
// To enable, set the USE_NGROK value to true in .env and update the NGROK_URL
const expensifyURLRoot = useNgrok && ngrokURL ? ngrokURL : expensifyComWithProxy;

export default {
    APP_NAME: 'NewExpensify',
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        // Note: This will be EXACTLY what is set for EXPENSIFY_URL whether the proxy is enabled or not.
        EXPENSIFY_URL: expensifyURL,
        SECURE_EXPENSIFY_URL: secureURLRoot,
        NEW_EXPENSIFY_URL: newExpensifyURL,
        URL_API_ROOT: expensifyURLRoot,
        STAGING_EXPENSIFY_URL: stagingExpensifyURL,
        STAGING_SECURE_EXPENSIFY_URL: stagingSecureExpensifyUrl,
        PARTNER_NAME: lodashGet(Config, 'EXPENSIFY_PARTNER_NAME', 'chat-expensify-com'),
        PARTNER_PASSWORD: lodashGet(Config, 'EXPENSIFY_PARTNER_PASSWORD', 'e21965746fd75f82bb66'),
        EXPENSIFY_CASH_REFERER: 'ecash',
        CONCIERGE_URL_PATHNAME: 'concierge/',
        CONCIERGE_URL: `${expensifyURL}concierge/`,
    },
    IS_IN_PRODUCTION: Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    IS_IN_STAGING: ENVIRONMENT === CONST.ENVIRONMENT.STAGING,
    IS_USING_LOCAL_WEB: useNgrok || expensifyURLRoot.includes('dev'),
    PUSHER: {
        APP_KEY: lodashGet(Config, 'PUSHER_APP_KEY', '268df511a204fbb60884'),
        SUFFIX: lodashGet(Config, 'PUSHER_DEV_SUFFIX', ''),
        CLUSTER: 'mt1',
    },
    SITE_TITLE: 'New Expensify',
    FAVICON: {
        DEFAULT: '/favicon.png',
        UNREAD: '/favicon-unread.png',
    },
    CAPTURE_METRICS: lodashGet(Config, 'CAPTURE_METRICS', 'false') === 'true',
    ONYX_METRICS: lodashGet(Config, 'ONYX_METRICS', 'false') === 'true',
    DEV_PORT: process.env.PORT || 8080,
    E2E_TESTING: lodashGet(Config, 'E2E_TESTING', 'false') === 'true',
    SEND_CRASH_REPORTS: lodashGet(Config, 'SEND_CRASH_REPORTS', 'false') === 'true',
};
