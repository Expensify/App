import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import CanFocusInputOnScreenFocus from './types';

const canFocusInputOnScreenFocus: CanFocusInputOnScreenFocus = () => !DeviceCapabilities.canUseTouchScreen();

export default canFocusInputOnScreenFocus;
