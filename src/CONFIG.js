import {Platform} from 'react-native';

const IS_IN_PRODUCTION = Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__;

export default {
    PUSHER: {
        APP_KEY: IS_IN_PRODUCTION ? '268df511a204fbb60884' : 'ac6d22b891daae55283a',
        AUTH_URL: IS_IN_PRODUCTION ? 'https://www.expensify.com' : 'https://www.expensify.com.dev',
        CLUSTER: 'mt1',
    },
    EXPENSIFY: {
        PARTNER_NAME: IS_IN_PRODUCTION ? 'chat-expensify-com' : 'android',
        PARTNER_PASSWORD: IS_IN_PRODUCTION ? 'e21965746fd75f82bb66' : 'c3a9ac418ea3f152aae2',
        API_ROOT: IS_IN_PRODUCTION ? 'https://www.expensify.com/api?' : 'https://www.expensify.com.dev/api?',
    }
};
