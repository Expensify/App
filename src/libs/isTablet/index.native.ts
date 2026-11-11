import DeviceInfo from 'react-native-device-info';

/** Whether the device is a tablet. */
function isTablet(): boolean {
    return DeviceInfo.isTablet();
}

export default isTablet;
