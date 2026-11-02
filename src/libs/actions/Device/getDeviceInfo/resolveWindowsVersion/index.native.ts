import type {DeviceInfo} from '@userActions/Device/getDeviceInfo/types';

import type ResolveWindowsVersion from './types';

// Native apps read the OS version from react-native-device-info, which is already accurate
const resolveWindowsVersion: ResolveWindowsVersion = (deviceInfo: DeviceInfo) => Promise.resolve(deviceInfo);

export default resolveWindowsVersion;
