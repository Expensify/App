import _ from 'underscore';
import {Platform} from 'react-native';
import Config from 'react-native-config';

// Let's make everyone's life just a bit easier
// by adding / to the end of any config URL's if it's not already present
if (_.isString(Config.NGROK_URL) && !Config.NGROK_URL.endsWith('/')) {
    Config.NGROK_URL += '/';
}
if (_.isString(Config.EXPENSIFY_URL_CASH) && !Config.EXPENSIFY_URL_CASH.endsWith('/')) {
    Config.EXPENSIFY_URL_CASH += '/';
}
if (_.isString(Config.EXPENSIFY_URL_COM) && !Config.EXPENSIFY_URL_COM.endsWith('/')) {
    Config.EXPENSIFY_URL_COM += '/';
}

const expensifyCom = Config.USE_WEB_PROXY === 'true' ? '/' : Config.EXPENSIFY_URL_COM;

// Ngrok helps us avoid many of our cross-domain issues with connecting to our API
// and is reqired for viewing images on mobile and for developing on android
// To enable, set the USE_NGROK value to true in .env and update the NGROK_URL
const expensifyURLRoot = Config.USE_NGROK === 'true' && Config.NGROK_URL
    ? Config.NGROK_URL
    : expensifyCom;

export default {
    APP_NAME: 'ExpensifyCash',
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        URL_EXPENSIFY_COM: expensifyCom,
        URL_EXPENSIFY_CASH: Config.EXPENSIFY_URL_CASH,
        URL_API_ROOT: expensifyURLRoot,
        PARTNER_NAME: Config.EXPENSIFY_PARTNER_NAME,
        PARTNER_PASSWORD: Config.EXPENSIFY_PARTNER_PASSWORD,
    },
    // eslint-disable-next-line no-undef
    IS_IN_PRODUCTION: Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    PUSHER: {
        APP_KEY: Config.PUSHER_APP_KEY,
        CLUSTER: 'mt1',
    },
    SITE_TITLE: 'Expensify.cash',
    FAVICON: {
        DEFAULT: 'favicon.png',
        UNREAD: 'favicon-unread.png',
    },
    LOGIN: {
        PARTNER_USER_ID: Config.PARTNER_USER_ID,
        PARTNER_USER_SECRET: Config.PARTNER_USER_SECRET,
    },
};
