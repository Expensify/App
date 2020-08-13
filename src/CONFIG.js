import {Platform} from 'react-native';

// TODO: Fix this
import devConfig from './CONFIG.DEV.example';

// eslint-disable-next-line no-undef
const IS_IN_PRODUCTION = Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__;

export default {
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        API_ROOT: IS_IN_PRODUCTION ? 'https://www.expensify.com/api?' : 'https://www.expensify.com.dev/api?',
        PARTNER_NAME: IS_IN_PRODUCTION ? 'chat-expensify-com' : 'android',
        PARTNER_PASSWORD: IS_IN_PRODUCTION ? 'e21965746fd75f82bb66' : 'c3a9ac418ea3f152aae2',
    },
    IS_IN_PRODUCTION,
    PUSHER: {
        APP_KEY: IS_IN_PRODUCTION ? '268df511a204fbb60884' : 'ac6d22b891daae55283a',
        AUTH_URL: IS_IN_PRODUCTION ? 'https://www.expensify.com' : 'https://www.expensify.com.dev',
        CLUSTER: 'mt1',
    },
    REPORT_IDS: IS_IN_PRODUCTION ? '63212778,63212795,63212764,63212607,63699490' : devConfig.REPORT_IDS,
    SITE_TITLE: 'Chat',
};
