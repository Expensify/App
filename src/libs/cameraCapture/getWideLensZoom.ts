import type {CameraDevice} from 'react-native-vision-camera';

/**
 * The zoom of the wide-angle lens, v4's `device.neutralZoom`, which v5 dropped. On an iOS virtual device zoom 1 is the
 * widest lens, and `zoomLensSwitchFactors` follows `physicalDevices`. Android reports no switch factors.
 */
function getWideLensZoom(device: Pick<CameraDevice, 'physicalDevices' | 'zoomLensSwitchFactors'>): number {
    const wideLensIndex = device.physicalDevices.findIndex((physicalDevice) => physicalDevice.type === 'wide-angle');
    if (wideLensIndex <= 0) {
        return 1;
    }
    return device.zoomLensSwitchFactors.at(wideLensIndex - 1) ?? 1;
}

export default getWideLensZoom;
