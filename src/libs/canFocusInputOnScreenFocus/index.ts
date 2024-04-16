import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type CanFocusInputOnScreenFocus from './types';

const canFocusInputOnScreenFocus: CanFocusInputOnScreenFocus = () => !DeviceCapabilities.canUseTouchScreen();

export default canFocusInputOnScreenFocus;
