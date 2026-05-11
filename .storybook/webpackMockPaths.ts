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

    // These are needed because react-native-nitro-fetch references `react-native-nitro-text-decoder` package without actually importing it
    // This causes Webpack and therefore Storybook scripts to fail, because it tries to import the package and fails.
    'react-native-nitro-text-decoder': path.resolve(dirname, '../__mocks__/react-native-nitro-text-decoder.ts'),
};
/* eslint-enable @typescript-eslint/naming-convention */
