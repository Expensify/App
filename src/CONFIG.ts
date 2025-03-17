import HybridAppModule from '@expensify/react-native-hybrid-app';
import {Platform} from 'react-native';
import type {NativeConfig} from 'react-native-config';
import Config from 'react-native-config';
import CONST from './CONST';
import getPlatform from './libs/getPlatform';
import * as Url from './libs/Url';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to prevent headaches
const get = (config: NativeConfig, key: string, defaultValue: string): string => (config?.[key] ?? defaultValue).trim();

// Set default values to contributor friendly values to make development work out of the box without an .env file
const ENVIRONMENT = get(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);
const newExpensifyURL = Url.addTrailingForwardSlash(get(Config, 'NEW_EXPENSIFY_URL', 'https://new.expensify.com/'));
const expensifyURL = Url.addTrailingForwardSlash(get(Config, 'EXPENSIFY_URL', 'https://www.expensify.com/'));
const stagingExpensifyURL = Url.addTrailingForwardSlash(get(Config, 'STAGING_EXPENSIFY_URL', 'https://staging.expensify.com/'));
const stagingSecureExpensifyUrl = Url.addTrailingForwardSlash(get(Config, 'STAGING_SECURE_EXPENSIFY_URL', 'https://staging-secure.expensify.com/'));
const ngrokURL = Url.addTrailingForwardSlash(get(Config, 'NGROK_URL', ''));
const secureNgrokURL = Url.addTrailingForwardSlash(get(Config, 'SECURE_NGROK_URL', ''));
const secureExpensifyUrl = Url.addTrailingForwardSlash(get(Config, 'SECURE_EXPENSIFY_URL', 'https://secure.expensify.com/'));
const useNgrok = get(Config, 'USE_NGROK', 'false') === 'true';
const useWebProxy = get(Config, 'USE_WEB_PROXY', 'true') === 'true';
const expensifyComWithProxy = getPlatform() === 'web' && useWebProxy ? '/' : expensifyURL;
const googleGeolocationAPIKey = get(Config, 'GCP_GEOLOCATION_API_KEY', '');

// Throw errors on dev if config variables are not set correctly
if (ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
    if (!useNgrok && expensifyURL.includes('dev') && !secureExpensifyUrl.includes('dev')) {
        throw new Error('SECURE_EXPENSIFY_URL must end with .dev when EXPENSIFY_URL ends with .dev');
    }

    if (useNgrok && !secureNgrokURL) {
        throw new Error('SECURE_NGROK_URL must be defined in .env when USE_NGROK=true');
    }
}

const secureURLRoot = useNgrok && secureNgrokURL ? secureNgrokURL : secureExpensifyUrl;

// Ngrok helps us avoid many of our cross-domain issues with connecting to our API
// and is required for viewing images on mobile and for developing on android
// To enable, set the USE_NGROK value to true in .env and update the NGROK_URL
const expensifyURLRoot = useNgrok && ngrokURL ? ngrokURL : expensifyComWithProxy;

export default {
    APP_NAME: 'NewExpensify',
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    ENVIRONMENT,
    EXPENSIFY: {
        // Note: This will be EXACTLY what is set for EXPENSIFY_URL whether the proxy is enabled or not.
        EXPENSIFY_URL: expensifyURL,
        SECURE_EXPENSIFY_URL: secureExpensifyUrl,
        NEW_EXPENSIFY_URL: newExpensifyURL,

        // The DEFAULT API is the API used by most environments, except staging, where we use STAGING (defined below)
        // The "staging toggle" in settings toggles between DEFAULT and STAGING APIs
        // On both STAGING and PROD this (DEFAULT) address points to production
        // On DEV it can be configured through ENV settings and can be a proxy or ngrok address (defaults to PROD)
        // Usually you don't need to use this URL directly - prefer `ApiUtils.getApiRoot()`
        DEFAULT_API_ROOT: expensifyURLRoot,
        DEFAULT_SECURE_API_ROOT: secureURLRoot,
        STAGING_API_ROOT: stagingExpensifyURL,
        STAGING_SECURE_API_ROOT: stagingSecureExpensifyUrl,
        PARTNER_NAME: get(Config, 'EXPENSIFY_PARTNER_NAME', 'chat-expensify-com'),
        PARTNER_PASSWORD: get(Config, 'EXPENSIFY_PARTNER_PASSWORD', 'e21965746fd75f82bb66'),
        EXPENSIFY_CASH_REFERER: 'ecash',
        CONCIERGE_URL_PATHNAME: 'concierge/',
        DEVPORTAL_URL_PATHNAME: '_devportal/',
        CONCIERGE_URL: `${expensifyURL}concierge/`,
        SAML_URL: `${expensifyURL}authentication/saml/login`,
    },
    IS_IN_PRODUCTION: Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    IS_IN_STAGING: ENVIRONMENT === CONST.ENVIRONMENT.STAGING,
    IS_USING_LOCAL_WEB: useNgrok || expensifyURLRoot.includes('dev'),
    PUSHER: {
        APP_KEY: get(Config, 'PUSHER_APP_KEY', '268df511a204fbb60884'),
        SUFFIX: ENVIRONMENT === CONST.ENVIRONMENT.DEV ? get(Config, 'PUSHER_DEV_SUFFIX', '') : '',
        CLUSTER: 'mt1',
    },
    SITE_TITLE: 'New Expensify',
    FAVICON: {
        DEFAULT: '/favicon.png',
        UNREAD: '/favicon-unread.png',
    },
    CAPTURE_METRICS: get(Config, 'CAPTURE_METRICS', 'false') === 'true',
    ONYX_METRICS: get(Config, 'ONYX_METRICS', 'false') === 'true',
    DEV_PORT: process.env.PORT ?? 8082,
    E2E_TESTING: get(Config, 'E2E_TESTING', 'false') === 'true',
    SEND_CRASH_REPORTS: get(Config, 'SEND_CRASH_REPORTS', 'false') === 'true',
    IS_USING_WEB_PROXY: getPlatform() === 'web' && useWebProxy,
    APPLE_SIGN_IN: {
        SERVICE_ID: 'com.chat.expensify.chat.AppleSignIn',
        REDIRECT_URI: `${newExpensifyURL}appleauth`,
    },
    GOOGLE_SIGN_IN: {
        WEB_CLIENT_ID: '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com',
        IOS_CLIENT_ID: '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com',
    },
    GCP_GEOLOCATION_API_KEY: googleGeolocationAPIKey,
    FIREBASE_WEB_CONFIG: {
        apiKey: get(Config, 'FB_API_KEY', 'AIzaSyBrLKgCuo6Vem6Xi5RPokdumssW8HaWBow'),
        appId: get(Config, 'FB_APP_ID', '1:1008697809946:web:ca25268d2645fc285445a3'),
        projectId: get(Config, 'FB_PROJECT_ID', 'expensify-mobile-app'),
    },
    // to read more about StrictMode see: contributingGuides/STRICT_MODE.md
    USE_REACT_STRICT_MODE_IN_DEV: false,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    IS_TEST_ENV: process.env.NODE_ENV === 'test',
    // eslint-disable-next-line no-restricted-properties
    IS_HYBRID_APP: HybridAppModule.isHybridApp(),
} as const;
