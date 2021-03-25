import lodashGet from 'lodash/get';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import getPlatform from './libs/getPlatform/index';

/**
 * Let's make everyone's life just a bit easier by adding / to the end of any config URL's if it's not already present
 * @param {String} url
 * @returns {String}
 */
function wrapWithBackslash(url) {
    if (!url.endsWith('/')) {
        return `${url}/`;
    }
    return url;
}

// Set default values to contributor friendly values to make development work out of the box without an .env file
const expensifyCashURL = wrapWithBackslash(lodashGet(Config, 'EXPENSIFY_URL_CASH', 'https://expensify.cash/'));
const expensifyURL = wrapWithBackslash(lodashGet(Config, 'EXPENSIFY_URL_COM', 'https://www.expensify.com/'));
const ngrokURL = wrapWithBackslash(lodashGet(Config, 'NGROK_URL_COM', ''));
const useNgrok = lodashGet(Config, 'USE_NGROK_COM', 'false') === 'true';
const useWebProxy = lodashGet(Config, 'USE_WEB_PROXY', 'true') === 'true';
const expensifyComWithProxy = getPlatform() === 'web' && useWebProxy ? '/' : expensifyURL;

// Ngrok helps us avoid many of our cross-domain issues with connecting to our API
// and is required for viewing images on mobile and for developing on android
// To enable, set the USE_NGROK_COM value to true in .env and update the NGROK_URL_COM
const expensifyURLRoot = useNgrok && ngrokURL ? ngrokURL : expensifyComWithProxy;

export default {
    APP_NAME: 'ExpensifyCash',
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        // Note: This will be EXACTLY what is set for EXPENSIFY_URL_COM whether the proxy is enabled or not.
        URL_EXPENSIFY_COM: expensifyURL,
        URL_EXPENSIFY_CASH: expensifyCashURL,
        URL_API_ROOT: expensifyURLRoot,
        PARTNER_NAME: lodashGet(Config, 'EXPENSIFY_PARTNER_NAME', 'chat-expensify-com'),
        PARTNER_PASSWORD: lodashGet(Config, 'EXPENSIFY_PARTNER_PASSWORD', 'e21965746fd75f82bb66'),
    },
    // eslint-disable-next-line no-undef
    IS_IN_PRODUCTION: Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    PUSHER: {
        APP_KEY: lodashGet(Config, 'PUSHER_APP_KEY', '268df511a204fbb60884'),
        CLUSTER: 'mt1',
    },
    SITE_TITLE: 'Expensify.cash',
    FAVICON: {
        DEFAULT: '/favicon.png',
        UNREAD: '/favicon-unread.png',
    },
};
