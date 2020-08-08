// TODO: Figure out how to determine prod/dev on mobile, etc.
const IS_IN_PRODUCTION = false;

export default {
    PUSHER: {
        APP_KEY: '829fd8fd2a6036568469',
        CLUSTER: 'us3',
    },
    EXPENSIFY: {
        PARTNER_NAME: IS_IN_PRODUCTION ? 'chat-expensify-com' : 'android',
        PARTNER_PASSWORD: IS_IN_PRODUCTION ? 'e21965746fd75f82bb66' : 'c3a9ac418ea3f152aae2',
        API_ROOT: IS_IN_PRODUCTION ? 'https://www.expensify.com/api?' : 'https://www.expensify.com.dev/api?',
    }
};
