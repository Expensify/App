import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginRepack} from '@rnef/plugin-repack';

const isHybrid = process.env.IS_HYBRID_APP === 'true';

/** @type {import('@rnef/config').Config} */
export default {
    remoteCacheProvider: null,
    bundler: pluginRepack(),
    platforms: {
        ios: platformIOS({sourceDir: isHybrid ? './Mobile-Expensify/iOS' : './ios'}),
        android: platformAndroid({sourceDir: isHybrid ? './Mobile-Expensify/Android' : './android'}),
    },
};
