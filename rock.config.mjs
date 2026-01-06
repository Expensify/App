import {platformAndroid} from '@rock-js/platform-android';
import {platformIOS} from '@rock-js/platform-ios';
import {pluginMetro} from '@rock-js/plugin-metro';
import {providerS3} from '@rock-js/provider-s3';

const isHybrid = process.env.IS_HYBRID_APP === 'true';
const isPublicAccess = !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY;

/** @type {import('@rock-js/config').Config} */
export default {
    remoteCacheProvider: providerS3({
        bucket: 'ad-hoc-expensify-cash',
        region: 'us-east-1',
        acl: 'public-read',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        publicAccess: isPublicAccess,
    }),
    bundler: pluginMetro(),
    platforms: {
        ios: platformIOS({sourceDir: isHybrid ? './Mobile-Expensify/iOS' : './ios'}),
        android: platformAndroid({sourceDir: isHybrid ? './Mobile-Expensify/Android' : './android'}),
    },
    fingerprint: {
        env: ['USE_WEB_PROXY', 'PUSHER_DEV_SUFFIX', 'SECURE_NGROK_URL', 'NGROK_URL', 'USE_NGROK'],
        ignorePaths: ['Mobile-Expensify/Android/assets/app/shared/bundle.js'],
    },
    // Forces React Native to build from source to include our custom patches
    usePrebuiltRNCore: 0,
};
