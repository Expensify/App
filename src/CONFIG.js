import lodashGet from 'lodash/get';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import getPlatform from './libs/getPlatform/index';
import * as Url from './libs/Url';
import CONST from './CONST';

// Set default values to contributor friendly values to make development work out of the box without an .env file
const ENVIRONMENT = lodashGet(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);
const newExpensifyURL = Url.addTrailingForwardSlash(lodashGet(Config, 'EXPENSIFY_URL_CASH', 'https://new.expensify.com/'));
const expensifyURL = Url.addTrailingForwardSlash(lodashGet(Config, 'EXPENSIFY_URL_COM', 'https://www.expensify.com/'));
const ngrokURL = Url.addTrailingForwardSlash(lodashGet(Config, 'NGROK_URL', ''));
const secureNgrokURL = Url.addTrailingForwardSlash(lodashGet(Config, 'SECURE_NGROK_URL', ''));
const expensifyURLSecure = Url.addTrailingForwardSlash(lodashGet(
    Config, 'EXPENSIFY_URL_SECURE', 'https://secure.expensify.com/',
));
const useNgrok = lodashGet(Config, 'USE_NGROK', 'false') === 'true';
const useWebProxy = lodashGet(Config, 'USE_WEB_PROXY', 'true') === 'true';
const expensifyComWithProxy = getPlatform() === 'web' && useWebProxy ? '/' : expensifyURL;

// Throw errors on dev if config variables are not set correctly
if (ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
    if (!useNgrok && expensifyURL.includes('dev') && !expensifyURLSecure.includes('dev')) {
        throw new Error('EXPENSIFY_URL_SECURE must end with .dev when EXPENSIFY_URL_COM ends with .dev');
    }

    if (useNgrok && !secureNgrokURL) {
        throw new Error('SECURE_NGROK_URL must be defined in .env when USE_NGROK=true');
    }
}

const secureURLRoot = useNgrok && secureNgrokURL ? secureNgrokURL : expensifyURLSecure;

// Ngrok helps us avoid many of our cross-domain issues with connecting to our API
// and is required for viewing images on mobile and for developing on android
// To enable, set the USE_NGROK value to true in .env and update the NGROK_URL
const expensifyURLRoot = useNgrok && ngrokURL ? ngrokURL : expensifyComWithProxy;

export default {
    APP_NAME: 'NewExpensify',
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        // Note: This will be EXACTLY what is set for EXPENSIFY_URL_COM whether the proxy is enabled or not.
        URL_EXPENSIFY_COM: expensifyURL,
        URL_EXPENSIFY_SECURE: secureURLRoot,
        NEW_EXPENSIFY_URL: newExpensifyURL,
        URL_API_ROOT: expensifyURLRoot,
        PARTNER_NAME: lodashGet(Config, 'EXPENSIFY_PARTNER_NAME', 'chat-expensify-com'),
        PARTNER_PASSWORD: lodashGet(Config, 'EXPENSIFY_PARTNER_PASSWORD', 'e21965746fd75f82bb66'),
        EXPENSIFY_CASH_REFERER: 'ecash',
    },
    IS_IN_PRODUCTION: Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    PUSHER: {
        APP_KEY: lodashGet(Config, 'PUSHER_APP_KEY', '268df511a204fbb60884'),
        CLUSTER: 'mt1',
    },
    SITE_TITLE: 'New Expensify',
    FAVICON: {
        DEFAULT: '/favicon.png',
        UNREAD: '/favicon-unread.png',
    },
    CAPTURE_METRICS: lodashGet(Config, 'CAPTURE_METRICS', 'false') === 'true',
    ONYX_METRICS: lodashGet(Config, 'ONYX_METRICS', 'false') === 'true',
};
