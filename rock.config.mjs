import {platformAndroid} from '@rock-js/platform-android';
import {platformIOS} from '@rock-js/platform-ios';
import {pluginMetro} from '@rock-js/plugin-metro';
import {pluginRepack} from '@rock-js/plugin-repack';
import {providerS3} from '@rock-js/provider-s3';

const isHybrid = process.env.IS_HYBRID_APP === 'true';
// Metro stays installed so `BUNDLER=metro` switches the whole native build back with no code change.
const useMetro = process.env.BUNDLER === 'metro';
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
    bundler: useMetro ? pluginMetro() : pluginRepack(),
    platforms: {
        ios: platformIOS({sourceDir: isHybrid ? './Mobile-Expensify/iOS' : './ios'}),
        android: platformAndroid({sourceDir: isHybrid ? './Mobile-Expensify/Android' : './android'}),
    },
    fingerprint: {
        extraSources: [
            'android/gradle.properties',
            'ios/Podfile',
            'scripts/artifacts-utils/compute-patches-hash.sh',
            'patches',
            ...(isHybrid ? ['Mobile-Expensify/patches'] : []),
            '.github/actions/composite/getXcodeVersion/action.yml',
        ],
        env: ['BUNDLER', 'USE_WEB_PROXY', 'PUSHER_DEV_SUFFIX', 'SECURE_NGROK_URL', 'NGROK_URL', 'USE_NGROK', 'FORCE_NATIVE_BUILD'],
        ignorePaths: ['Mobile-Expensify/Android/assets/app/shared/bundle.js'],
    },
    // Forces React Native to build from source to include our custom patches
    usePrebuiltRNCore: false,
};
