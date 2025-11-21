import {platformAndroid} from '@rock-js/platform-android';
import {platformIOS} from '@rock-js/platform-ios';
import {pluginMetro} from '@rock-js/plugin-metro';
import {providerGitHub} from '@rock-js/provider-github';

const isHybrid = process.env.IS_HYBRID_APP === 'true';

/** @type {import('@rock-js/config').Config} */
export default {
    remoteCacheProvider: providerGitHub({
        owner: 'Expensify',
        repository: 'App',
        token: process.env.GITHUB_TOKEN,
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
};
