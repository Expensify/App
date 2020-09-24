import {Platform} from 'react-native';

export default {
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        API_ROOT: 'https://www.expensify.com/api?',
        PARTNER_NAME: 'chat-expensify-com',
        PARTNER_PASSWORD: 'e21965746fd75f82bb66',
    },
    // eslint-disable-next-line no-undef
    IS_IN_PRODUCTION: Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    PUSHER: {
        APP_KEY: '268df511a204fbb60884',
        CLUSTER: 'mt1',
    },
    REPORT_IDS: '63212778,63212795,63212764,63212607,63699490',
    SITE_TITLE: 'Chat',
    FAVICON: {
        DEFAULT: 'favicon.png',
        UNREAD: 'favicon-unread.png'
    },
    LOGIN: {
        PARTNER_USER_ID: '',
        PARTNER_USER_SECRET: '',
    }
};
