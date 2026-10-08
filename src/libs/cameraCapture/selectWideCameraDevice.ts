import type {CameraDevice, CameraPosition} from 'react-native-vision-camera';

/**
 * Prefers the virtual wide + ultra-wide camera. v5's `physicalDevices` filter can't pick it: single-lens devices report
 * no physical devices and Android reports every lens as 'unknown', so the first device in the list wins.
 */
function selectWideCameraDevice(devices: CameraDevice[], position: CameraPosition, defaultDevice: CameraDevice | undefined): CameraDevice | undefined {
    const wideAndUltraWide = devices.find((device) => {
        if (device.position !== position || device.physicalDevices.length !== 2) {
            return false;
        }
        const types = new Set(device.physicalDevices.map((physicalDevice) => physicalDevice.type));
        return types.has('wide-angle') && types.has('ultra-wide-angle');
    });
    return wideAndUltraWide ?? defaultDevice;
}

export default selectWideCameraDevice;
