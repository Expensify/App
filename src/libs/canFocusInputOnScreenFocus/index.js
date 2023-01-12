import * as DeviceCapabilities from '../DeviceCapabilities';

export default () => !DeviceCapabilities.canUseTouchScreen();
