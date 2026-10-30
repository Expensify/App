// The real implementation is imported through its explicit index path, which the `canUseTouchScreen` alias does not match
import realCanUseTouchScreen from '@libs/DeviceCapabilities/canUseTouchScreen/index';
import type CanUseTouchScreen from '@libs/DeviceCapabilities/canUseTouchScreen/types';

import {getDeviceMode, isTouchDeviceMode} from './deviceMode';

/**
 * Storybook-only replacement for `@libs/DeviceCapabilities/canUseTouchScreen`, aliased in `.storybook/mockPaths.ts`.
 * Reports the touch support of the stored device mode, and otherwise the real one.
 */
const canUseTouchScreen: CanUseTouchScreen = () => {
    const deviceMode = getDeviceMode();
    return deviceMode ? isTouchDeviceMode(deviceMode) : realCanUseTouchScreen();
};

export default canUseTouchScreen;
