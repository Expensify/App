import preferPhaseDetectionFormatAndroid from '@pages/iou/request/step/IOURequestStepScan/utils/preferPhaseDetectionFormat/index.android';
import preferPhaseDetectionFormatIOS from '@pages/iou/request/step/IOURequestStepScan/utils/preferPhaseDetectionFormat/index.ios';

import type {CameraDevice, CameraDeviceFormat} from 'react-native-vision-camera';

type FormatOverrides = Partial<Pick<CameraDeviceFormat, 'photoWidth' | 'photoHeight' | 'videoWidth' | 'videoHeight' | 'minFps' | 'maxFps' | 'autoFocusSystem'>>;

function createFormat(overrides: FormatOverrides = {}): CameraDeviceFormat {
    return {
        photoWidth: 2880,
        photoHeight: 2160,
        videoWidth: 2880,
        videoHeight: 2160,
        minFps: 30,
        maxFps: 30,
        autoFocusSystem: 'contrast-detection',
        minISO: 0,
        maxISO: 0,
        fieldOfView: 0,
        supportsVideoHdr: false,
        supportsPhotoHdr: false,
        supportsDepthCapture: false,
        videoStabilizationModes: [],
        ...overrides,
    };
}

function createDevice(formats: CameraDeviceFormat[]): Pick<CameraDevice, 'formats'> {
    return {formats};
}

const CONTRAST_FORMAT = createFormat();
const EQUIVALENT_PHASE_FORMAT = createFormat({autoFocusSystem: 'phase-detection'});

describe('preferPhaseDetectionFormat', () => {
    it('swaps to a phase-detection format with identical dimensions and frame rate', () => {
        const device = createDevice([CONTRAST_FORMAT, EQUIVALENT_PHASE_FORMAT]);

        expect(preferPhaseDetectionFormatIOS({device, format: CONTRAST_FORMAT})).toBe(EQUIVALENT_PHASE_FORMAT);
    });

    it('keeps the selected format when the only phase-detection candidate has a different resolution', () => {
        const lowerResolutionPhaseFormat = createFormat({autoFocusSystem: 'phase-detection', photoWidth: 1920, photoHeight: 1440});
        const device = createDevice([CONTRAST_FORMAT, lowerResolutionPhaseFormat]);

        expect(preferPhaseDetectionFormatIOS({device, format: CONTRAST_FORMAT})).toBe(CONTRAST_FORMAT);
    });

    it('keeps the selected format when the only phase-detection candidate has a different frame rate range', () => {
        const highFrameRatePhaseFormat = createFormat({autoFocusSystem: 'phase-detection', maxFps: 60});
        const device = createDevice([CONTRAST_FORMAT, highFrameRatePhaseFormat]);

        expect(preferPhaseDetectionFormatIOS({device, format: CONTRAST_FORMAT})).toBe(CONTRAST_FORMAT);
    });

    it('keeps the selected format when no phase-detection candidate exists', () => {
        const device = createDevice([CONTRAST_FORMAT, createFormat({videoWidth: 1920, videoHeight: 1440})]);

        expect(preferPhaseDetectionFormatIOS({device, format: CONTRAST_FORMAT})).toBe(CONTRAST_FORMAT);
    });

    it('leaves a format that already uses phase detection alone', () => {
        const device = createDevice([EQUIVALENT_PHASE_FORMAT, createFormat({autoFocusSystem: 'phase-detection'})]);

        expect(preferPhaseDetectionFormatIOS({device, format: EQUIVALENT_PHASE_FORMAT})).toBe(EQUIVALENT_PHASE_FORMAT);
    });

    it('passes an undefined format through', () => {
        const device = createDevice([EQUIVALENT_PHASE_FORMAT]);

        expect(preferPhaseDetectionFormatIOS({device, format: undefined})).toBeUndefined();
    });

    it('never swaps on Android, where no format reports phase detection', () => {
        const device = createDevice([CONTRAST_FORMAT, EQUIVALENT_PHASE_FORMAT]);

        expect(preferPhaseDetectionFormatAndroid({device, format: CONTRAST_FORMAT})).toBe(CONTRAST_FORMAT);
    });
});
