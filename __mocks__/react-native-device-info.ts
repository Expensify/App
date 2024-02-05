import type DeviceInfoModule from 'react-native-device-info';
import MockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';

const DeviceInfo: typeof DeviceInfoModule = MockDeviceInfo;

export default DeviceInfo;
