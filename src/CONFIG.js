import {Platform} from 'react-native';
import Config from 'react-native-config';

export default {
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        // TODO: Fix hard coded values
        API_ROOT: 'https://www.expensify.com.dev/api?',
        SITE_ROOT: 'https://chat.expensify.com.dev/',
        PARTNER_NAME: 'android',
        PARTNER_PASSWORD: 'c3a9ac418ea3f152aae2',
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
