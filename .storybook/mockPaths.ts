import path from 'path';
import {fileURLToPath} from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Storybook-only alias overrides
/* eslint-disable @typescript-eslint/naming-convention */
export default {
    '@react-native-community/netinfo': path.resolve(dirname, '../__mocks__/@react-native-community/netinfo.ts'),
    // The static mock, plus a story-owned route stack so a whole flow can mount
    '@react-navigation/native': path.resolve(dirname, './mocks/react-navigation-native.ts'),
    // Modal backdrops read the stack card animation, which no story mounts
    '@react-navigation/stack': path.resolve(dirname, './mocks/react-navigation-stack.ts'),
};
/* eslint-enable @typescript-eslint/naming-convention */
