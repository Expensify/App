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
    // Let stories pick a device mode (src/stories/mocks/deviceMode.ts), so a desktop browser can render the touch and landscape layouts.
    // Keyed by the resolved paths because the shared `@hooks`/`@libs` aliases are matched first and rewrite the requests to them.
    [`${path.resolve(dirname, '../src/hooks/useIsInLandscapeMode')}$`]: path.resolve(dirname, '../src/stories/mocks/useIsInLandscapeMode.ts'),
    [`${path.resolve(dirname, '../src/libs/DeviceCapabilities/canUseTouchScreen')}$`]: path.resolve(dirname, '../src/stories/mocks/canUseTouchScreen.ts'),
    [`${path.resolve(dirname, '../src/libs/isInLandscapeMode')}$`]: path.resolve(dirname, '../src/stories/mocks/isInLandscapeMode.ts'),
};
/* eslint-enable @typescript-eslint/naming-convention */
