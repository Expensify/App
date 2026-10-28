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

/**
 * Unset when it would be 1: VisionCamera re-applies `zoom` from JS after configuring, and on Android that call can land
 * before the camera starts, so CameraX rejects it with "Camera is not active" through `onError`.
 */
function getZoomProp(device: Pick<CameraDevice, 'physicalDevices' | 'zoomLensSwitchFactors'>): number | undefined {
    const zoom = getWideLensZoom(device);
    return zoom === 1 ? undefined : zoom;
}

export default getWideLensZoom;
export {getZoomProp};
