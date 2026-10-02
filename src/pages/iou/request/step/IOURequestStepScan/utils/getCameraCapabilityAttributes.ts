import getWideLensZoom from '@libs/cameraCapture/getWideLensZoom';

import CONST from '@src/CONST';

import type {SpanAttributeValue} from '@sentry/core';
import type {AutoFocusSystem, CameraDevice} from 'react-native-vision-camera';

type CameraCapabilities = Pick<CameraDevice, 'physicalDevices' | 'zoomLensSwitchFactors'>;

/** Camera capabilities attached to the SPAN_CAMERA_INIT span. VisionCamera v5 has no formats, so those attributes are undefined. */
function getCameraCapabilityAttributes(device: CameraCapabilities | undefined, autoFocusSystem?: AutoFocusSystem): Record<string, SpanAttributeValue | undefined> {
    if (!device) {
        return {};
    }

    return {
        [CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: undefined,
        [CONST.TELEMETRY.ATTRIBUTE_SELECTED_FORMAT_AF_SYSTEM]: autoFocusSystem,
        [CONST.TELEMETRY.ATTRIBUTE_PHASE_DETECTION_FORMAT_COUNT]: undefined,
        [CONST.TELEMETRY.ATTRIBUTE_MIN_FOCUS_DISTANCE]: undefined,
        // v5 reports no physical devices for a single-lens device; v4 reported itself.
        [CONST.TELEMETRY.ATTRIBUTE_PHYSICAL_DEVICE_COUNT]: Math.max(device.physicalDevices.length, 1),
        [CONST.TELEMETRY.ATTRIBUTE_NEUTRAL_ZOOM]: getWideLensZoom(device),
    };
}

export default getCameraCapabilityAttributes;
