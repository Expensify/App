import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginRepack} from '@rnef/plugin-repack';
import {providerGitHub} from '@rnef/provider-github';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isHybrid = process.env.IS_HYBRID_APP === 'true';

/** @type {import('@rnef/config').Config} */
export default {
    remoteCacheProvider: providerGitHub({
        owner: 'Expensify',
        repository: 'App',
        token: process.env.GITHUB_TOKEN,
    }),
    bundler: pluginRepack({
        reactNativePath: path.resolve(__dirname, 'node_modules/react-native'),
    }),
    platforms: {
        ios: platformIOS({sourceDir: isHybrid ? './Mobile-Expensify/iOS' : './ios'}),
        android: platformAndroid({sourceDir: isHybrid ? './Mobile-Expensify/Android' : './android'}),
    },
};
