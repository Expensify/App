import getCameraCapabilityAttributes from '@pages/iou/request/step/IOURequestStepScan/utils/getCameraCapabilityAttributes';

import CONST from '@src/CONST';

import type {CameraDevice, DeviceType} from 'react-native-vision-camera';

function createLens(type: DeviceType): CameraDevice {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {type} as CameraDevice;
}

function createDevice(lensTypes: DeviceType[], zoomLensSwitchFactors: number[]): Pick<CameraDevice, 'physicalDevices' | 'zoomLensSwitchFactors'> {
    return {physicalDevices: lensTypes.map(createLens), zoomLensSwitchFactors};
}

describe('getCameraCapabilityAttributes', () => {
    it('reports nothing while the device is still loading', () => {
        // Given no device yet
        // When the attributes are derived
        // Then the span gets no camera attributes, rather than guessed ones
        expect(getCameraCapabilityAttributes(undefined)).toEqual({});
    });

    it('reports the lens count and the zoom of the wide lens on a virtual device', () => {
        // Given an iPhone's ultra-wide + wide virtual device, which switches to the wide lens at 2x
        const device = createDevice(['ultra-wide-angle', 'wide-angle'], [2]);

        // When the attributes are derived
        const attributes = getCameraCapabilityAttributes(device);

        // Then the neutral zoom is the wide lens, which is what the camera now opens at
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_PHYSICAL_DEVICE_COUNT]).toBe(2);
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_NEUTRAL_ZOOM]).toBe(2);
    });

    it('counts a single-lens device as one lens', () => {
        // Given a physical device, which VisionCamera v5 reports with no physical devices (v4 reported itself)
        const device = createDevice([], []);

        // When the attributes are derived
        const attributes = getCameraCapabilityAttributes(device);

        // Then the count stays comparable with the v4 data, and the zoom is 1
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_PHYSICAL_DEVICE_COUNT]).toBe(1);
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_NEUTRAL_ZOOM]).toBe(1);
    });

    it('reports the autofocus system of the configuration the session picked', () => {
        // Given the session picked a phase-detection configuration
        const device = createDevice(['ultra-wide-angle', 'wide-angle'], [2]);

        // When the attributes are derived with that autofocus system
        const attributes = getCameraCapabilityAttributes(device, 'phase-detection');

        // Then it fills the attribute v4 took from the selected format, so the autofocus dashboards keep working
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_SELECTED_FORMAT_AF_SYSTEM]).toBe('phase-detection');
    });
});
