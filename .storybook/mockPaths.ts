import path from 'path';
import {fileURLToPath} from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Storybook-only alias overrides. `react-native-config`/`react-native$` are intentionally NOT
// repeated here — they're already set in the main app's `resolve.alias` (see rsbuild.common.ts),
// which this file's rsbuild.config.ts spreads in after this object.
/* eslint-disable @typescript-eslint/naming-convention */
export default {
    '@react-native-community/netinfo': path.resolve(dirname, '../__mocks__/@react-native-community/netinfo.ts'),
    '@react-navigation/native': path.resolve(dirname, '../__mocks__/@react-navigation/native'),
};
/* eslint-enable @typescript-eslint/naming-convention */
