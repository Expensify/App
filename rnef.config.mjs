import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginMetro} from '@rnef/plugin-metro';
import {providerGitHub} from '@rnef/provider-github';

const isHybrid = process.env.IS_HYBRID_APP === 'true';

/** @type {import('@rnef/config').Config} */
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
};
