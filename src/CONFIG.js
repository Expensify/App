import {Platform} from 'react-native';
import devConfig from './CONFIG.DEV';

// eslint-disable-next-line no-undef
const IS_IN_PRODUCTION = Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__;

export default {
    IS_IN_PRODUCTION,
    SITE_TITLE: 'Chat',
    PUSHER: {
        APP_KEY: IS_IN_PRODUCTION ? '268df511a204fbb60884' : 'ac6d22b891daae55283a',
        AUTH_URL: IS_IN_PRODUCTION ? 'https://www.expensify.com' : 'https://www.expensify.com.dev',
        CLUSTER: 'mt1',
    },
    EXPENSIFY: {
        PARTNER_NAME: IS_IN_PRODUCTION ? 'chat-expensify-com' : 'android',
        PARTNER_PASSWORD: IS_IN_PRODUCTION ? 'e21965746fd75f82bb66' : 'c3a9ac418ea3f152aae2',
        API_ROOT: IS_IN_PRODUCTION ? 'https://www.expensify.com/api?' : 'https://www.expensify.com.dev/api?',
    },
    REPORT_IDS: IS_IN_PRODUCTION ? '63212778,63212795,63212764,63212607,63699490' : devConfig.REPORT_IDS,
};
