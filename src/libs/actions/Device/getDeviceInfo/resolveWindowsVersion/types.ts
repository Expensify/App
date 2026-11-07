import type {DeviceInfo} from '@userActions/Device/getDeviceInfo/types';

type ResolveWindowsVersion = (deviceInfo: DeviceInfo) => Promise<DeviceInfo>;

export default ResolveWindowsVersion;
