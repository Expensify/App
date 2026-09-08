import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import type CanFocusInputOnScreenFocus from './types';

const canFocusInputOnScreenFocus: CanFocusInputOnScreenFocus = () => !canUseTouchScreen();

export default canFocusInputOnScreenFocus;
