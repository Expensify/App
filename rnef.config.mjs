import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginMetro} from '@rnef/plugin-metro';

/** @type {import('@rnef/config').Config} */
export default {
    remoteCacheProvider: null,
    bundler: pluginMetro(),
    platforms: {
        ios: platformIOS(),
        android: platformAndroid(),
    },
    root: process.env.PROJECT_ROOT_PATH ?? './',
};
