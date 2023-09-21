import * as DeviceCapabilities from '../DeviceCapabilities';
import CanFocusInputOnScreenFocus from './types';

const canFocusInputOnScreenFocus: CanFocusInputOnScreenFocus = () => !DeviceCapabilities.canUseTouchScreen();

export default canFocusInputOnScreenFocus;
