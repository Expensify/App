import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginMetro} from '@rnef/plugin-metro';

const isHybrid = process.env.IS_HYBRID_APP === 'true';

/** @type {import('@rnef/config').Config} */
export default {
    remoteCacheProvider: null,
    bundler: pluginMetro(),
    platforms: {
        ios: platformIOS({sourceDir: isHybrid ? './iOS' : './ios'}),
        android: platformAndroid({sourceDir: isHybrid ? './Android' : './android'}),
    },
};
