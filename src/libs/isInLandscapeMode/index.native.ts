import DeviceInfo from 'react-native-device-info';

const isTablet = DeviceInfo.isTablet();

/**
 * Returns whether the device is currently in landscape orientation.
 * Returns false on tablets.
 */
export default function isInLandscapeMode(windowWidth: number, windowHeight: number): boolean {
    return !isTablet && windowWidth > windowHeight;
}
