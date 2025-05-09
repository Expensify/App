import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginMetro} from '@rnef/plugin-metro';

const isHybrid = process.env.IS_HYBRID_APP === 'true';
const hybridRoot = './Mobile-Expensify';

/** @type {import('@rnef/config').Config} */
export default {
    remoteCacheProvider: null,
    bundler: pluginMetro(),
    platforms: {
        ios: platformIOS({sourceDir: isHybrid ? `${hybridRoot}/iOS` : './ios'}),
        android: platformAndroid({sourceDir: isHybrid ? `${hybridRoot}/Android` : './android'}),
    },
    fingerprint: {
        extraSources: isHybrid ? [`${hybridRoot}/iOS`, `${hybridRoot}/Android`, `${hybridRoot}/patches`] : [],
    },
};
