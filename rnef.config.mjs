import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginMetro} from '@rnef/plugin-metro';

export default {
    remoteCacheProvider: null,
    plugins: [pluginMetro()],
    platforms: {
        ios: platformIOS(),
        android: platformAndroid(),
    },
    root: process.env.PROJECT_ROOT_PATH ?? './',
};
