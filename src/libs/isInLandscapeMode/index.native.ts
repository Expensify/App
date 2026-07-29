import DeviceInfo from 'react-native-device-info';

/**
 * Returns whether the device is currently in landscape orientation.
 * Returns false on tablets.
 */
export default function isInLandscapeMode(windowWidth: number, windowHeight: number): boolean {
    const isTablet = DeviceInfo.isTablet();
    return !isTablet && windowWidth > windowHeight;
}
