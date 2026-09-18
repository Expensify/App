import getCameraCapabilityAttributes from '@pages/iou/request/step/IOURequestStepScan/utils/getCameraCapabilityAttributes';

import CONST from '@src/CONST';

import type {CameraDevice, CameraDeviceFormat} from 'react-native-vision-camera';

type FormatOverrides = Partial<
    Pick<CameraDeviceFormat, 'photoWidth' | 'photoHeight' | 'videoWidth' | 'videoHeight' | 'minFps' | 'maxFps' | 'autoFocusSystem' | 'fieldOfView' | 'minISO' | 'maxISO'>
>;
type DeviceOverrides = Partial<Pick<CameraDevice, 'formats' | 'minFocusDistance' | 'physicalDevices' | 'neutralZoom'>>;

function createFormat(overrides: FormatOverrides = {}): CameraDeviceFormat {
    return {
        photoWidth: 2880,
        photoHeight: 2160,
        videoWidth: 2880,
        videoHeight: 2160,
        minFps: 30,
        maxFps: 30,
        autoFocusSystem: 'contrast-detection',
        minISO: 34,
        maxISO: 3264,
        fieldOfView: 68,
        supportsVideoHdr: false,
        supportsPhotoHdr: false,
        supportsDepthCapture: false,
        videoStabilizationModes: [],
        ...overrides,
    };
}

function createDevice(overrides: DeviceOverrides = {}): Required<DeviceOverrides> {
    return {
        formats: [],
        minFocusDistance: 12,
        physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera'],
        neutralZoom: 2,
        ...overrides,
    };
}

const CONTRAST_FORMAT = createFormat();
const INTERCHANGEABLE_PHASE_FORMAT = createFormat({autoFocusSystem: 'phase-detection'});

describe('getCameraCapabilityAttributes', () => {
    it('reports nothing while the device is still loading', () => {
        expect(getCameraCapabilityAttributes(undefined, CONTRAST_FORMAT)).toEqual({});
    });

    it('reports the lens facts that say whether a lens switch is even possible', () => {
        const attributes = getCameraCapabilityAttributes(createDevice({formats: [CONTRAST_FORMAT]}), CONTRAST_FORMAT);

        expect(attributes).toMatchObject({
            [CONST.TELEMETRY.ATTRIBUTE_MIN_FOCUS_DISTANCE]: 12,
            [CONST.TELEMETRY.ATTRIBUTE_PHYSICAL_DEVICE_COUNT]: 2,
            [CONST.TELEMETRY.ATTRIBUTE_NEUTRAL_ZOOM]: 2,
        });
    });

    it('records no focus distance when the device reports 0, which means unknown rather than zero', () => {
        const attributes = getCameraCapabilityAttributes(createDevice({formats: [CONTRAST_FORMAT], minFocusDistance: 0}), CONTRAST_FORMAT);

        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_MIN_FOCUS_DISTANCE]).toBeUndefined();
    });

    it('flags an interchangeable phase-detection format when one exists', () => {
        const device = createDevice({formats: [CONTRAST_FORMAT, INTERCHANGEABLE_PHASE_FORMAT]});

        expect(getCameraCapabilityAttributes(device, CONTRAST_FORMAT)).toMatchObject({
            [CONST.TELEMETRY.ATTRIBUTE_PHASE_DETECTION_FORMAT_COUNT]: 1,
            [CONST.TELEMETRY.ATTRIBUTE_SELECTED_FORMAT_AF_SYSTEM]: 'contrast-detection',
            [CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: true,
        });
    });

    it('does not flag a phase-detection format that differs in resolution', () => {
        const device = createDevice({formats: [CONTRAST_FORMAT, createFormat({autoFocusSystem: 'phase-detection', photoWidth: 1920, photoHeight: 1440})]});

        expect(getCameraCapabilityAttributes(device, CONTRAST_FORMAT)).toMatchObject({[CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: false});
    });

    it('does not flag a phase-detection format that differs in frame rate range', () => {
        const device = createDevice({formats: [CONTRAST_FORMAT, createFormat({autoFocusSystem: 'phase-detection', maxFps: 60})]});

        expect(getCameraCapabilityAttributes(device, CONTRAST_FORMAT)).toMatchObject({[CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: false});
    });

    it('does not flag a phase-detection format that would change the framing', () => {
        const device = createDevice({formats: [CONTRAST_FORMAT, createFormat({autoFocusSystem: 'phase-detection', fieldOfView: 52})]});

        expect(getCameraCapabilityAttributes(device, CONTRAST_FORMAT)).toMatchObject({[CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: false});
    });

    it('does not flag a phase-detection format with a narrower ISO range, which would capture differently in low light', () => {
        const device = createDevice({formats: [CONTRAST_FORMAT, createFormat({autoFocusSystem: 'phase-detection', maxISO: 1600})]});

        expect(getCameraCapabilityAttributes(device, CONTRAST_FORMAT)).toMatchObject({[CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: false});
    });

    it('does not flag anything when the selected format already focuses by phase detection', () => {
        const device = createDevice({formats: [INTERCHANGEABLE_PHASE_FORMAT, CONTRAST_FORMAT]});

        expect(getCameraCapabilityAttributes(device, INTERCHANGEABLE_PHASE_FORMAT)).toMatchObject({
            [CONST.TELEMETRY.ATTRIBUTE_SELECTED_FORMAT_AF_SYSTEM]: 'phase-detection',
            [CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: false,
        });
    });

    it('leaves the format questions unanswered when no format is selected yet', () => {
        const device = createDevice({formats: [CONTRAST_FORMAT, INTERCHANGEABLE_PHASE_FORMAT]});
        const attributes = getCameraCapabilityAttributes(device, undefined);

        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_SELECTED_FORMAT_AF_SYSTEM]).toBeUndefined();
        expect(attributes[CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]).toBeUndefined();
        expect(attributes).toMatchObject({[CONST.TELEMETRY.ATTRIBUTE_PHASE_DETECTION_FORMAT_COUNT]: 1});
    });
});
