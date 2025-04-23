import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginRepack} from '@rnef/plugin-repack';

/** @type {import('@rnef/config').Config} */
export default {
    remoteCacheProvider: null,
    bundler: pluginRepack(),
    platforms: {
        ios: platformIOS(),
        android: platformAndroid(),
    },
    root: process.env.PROJECT_ROOT_PATH ?? './',
};
