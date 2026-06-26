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
    // expensify-common@2.0.187+ restricts package exports; live-markdown still deep-imports dist/*.
    'expensify-common/dist/utils': path.resolve(dirname, '../node_modules/expensify-common/dist/utils.js'),
    'expensify-common/dist/Device': path.resolve(dirname, '../node_modules/expensify-common/dist/Device.js'),
};
/* eslint-enable @typescript-eslint/naming-convention */
