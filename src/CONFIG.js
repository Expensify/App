import {Platform} from 'react-native';
import Config from 'react-native-config';

// Updates the API_ROOT and SITE_ROOT to use the NGROK route if .env flag is enabled
// Otherwise it will use the value inside config.EXPENSIFY_SITE_ROOT
// DEFAULT_SITE_ROOT will always contain the default site root of www.expensify.com or www.expensify.com.dev
const expensifySiteURL = Config.USE_NGROK === 'true' && Config.NGROK_URL
    ? Config.NGROK_URL
    : Config.EXPENSIFY_SITE_ROOT;

export default {
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        DEFAULT_SITE_ROOT: Config.EXPENSIFY_SITE_ROOT,
        SITE_ROOT: expensifySiteURL,
        CASH_SITE_ROOT: Config.EXPENSIFY_CASH_ROOT,
        API_ROOT: `${expensifySiteURL}api?`,
        PARTNER_NAME: Config.EXPENSIFY_PARTNER_NAME,
        PARTNER_PASSWORD: Config.EXPENSIFY_PARTNER_PASSWORD,
    },
    // eslint-disable-next-line no-undef
    IS_IN_PRODUCTION: Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    PUSHER: {
        APP_KEY: Config.PUSHER_APP_KEY,
        CLUSTER: 'mt1',
    },
    SITE_TITLE: 'Chat',
    FAVICON: {
        DEFAULT: 'favicon.png',
        UNREAD: 'favicon-unread.png'
    },
    LOGIN: {
        PARTNER_USER_ID: Config.PARTNER_USER_ID,
        PARTNER_USER_SECRET: Config.PARTNER_USER_SECRET,
    }
};
