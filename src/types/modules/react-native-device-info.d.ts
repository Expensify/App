declare module 'react-native-device-info/jest/react-native-device-info-mock' {
    import type DeviceInfo from 'react-native-device-info';

    const MockDeviceInfo: typeof DeviceInfo;

    export default MockDeviceInfo;
}
