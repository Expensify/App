import path from 'path';
import {fileURLToPath} from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/* eslint-disable @typescript-eslint/naming-convention */
export default {
    'react-native-config': 'react-web-config',
    'react-native$': 'react-native-web',
    '@react-native-community/netinfo': path.resolve(dirname, '../__mocks__/@react-native-community/netinfo.ts'),
    '@react-navigation/native': path.resolve(dirname, '../__mocks__/@react-navigation/native'),
    // live-markdown still imports expensify-common/dist/utils; map to the canonical subpath file.
    'expensify-common/dist/utils': path.resolve(dirname, '../node_modules/expensify-common/dist/utils.js'),
};
/* eslint-enable @typescript-eslint/naming-convention */
