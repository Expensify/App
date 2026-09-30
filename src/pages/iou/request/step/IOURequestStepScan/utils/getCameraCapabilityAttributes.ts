/**
 * Derives telemetry attributes describing the camera's capabilities (autofocus system, lens count, focus distance, zoom)
 * so they can be attached to the SPAN_CAMERA_INIT span. Reads values the device already exposes; no behavior change.
 */
import CONST from '@src/CONST';

import type {SpanAttributeValue} from '@sentry/core';
import type {CameraDevice, CameraDeviceFormat} from 'react-native-vision-camera';

type CameraCapabilities = Pick<CameraDevice, 'formats' | 'minFocusDistance' | 'physicalDevices' | 'neutralZoom'>;

function isInterchangeable(candidate: CameraDeviceFormat, format: CameraDeviceFormat): boolean {
    return (
        candidate.photoWidth === format.photoWidth &&
        candidate.photoHeight === format.photoHeight &&
        candidate.videoWidth === format.videoWidth &&
        candidate.videoHeight === format.videoHeight &&
        candidate.minFps === format.minFps &&
        candidate.maxFps === format.maxFps &&
        candidate.fieldOfView === format.fieldOfView &&
        candidate.minISO === format.minISO &&
        candidate.maxISO === format.maxISO
    );
}

function getCameraCapabilityAttributes(device: CameraCapabilities | undefined, format: CameraDeviceFormat | undefined): Record<string, SpanAttributeValue | undefined> {
    if (!device) {
        return {};
    }

    let hasInterchangeablePhaseFormat: boolean | undefined;
    if (format) {
        hasInterchangeablePhaseFormat =
            format.autoFocusSystem !== 'phase-detection' && device.formats.some((candidate) => candidate.autoFocusSystem === 'phase-detection' && isInterchangeable(candidate, format));
    }

    return {
        [CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: hasInterchangeablePhaseFormat,
        [CONST.TELEMETRY.ATTRIBUTE_SELECTED_FORMAT_AF_SYSTEM]: format?.autoFocusSystem,
        [CONST.TELEMETRY.ATTRIBUTE_PHASE_DETECTION_FORMAT_COUNT]: device.formats.filter((candidate) => candidate.autoFocusSystem === 'phase-detection').length,

        // Vision Camera reports 0 when the real distance is unavailable, which is not a distance.
        [CONST.TELEMETRY.ATTRIBUTE_MIN_FOCUS_DISTANCE]: device.minFocusDistance > 0 ? device.minFocusDistance : undefined,

        [CONST.TELEMETRY.ATTRIBUTE_PHYSICAL_DEVICE_COUNT]: device.physicalDevices.length,
        [CONST.TELEMETRY.ATTRIBUTE_NEUTRAL_ZOOM]: device.neutralZoom,
    };
}

export default getCameraCapabilityAttributes;
