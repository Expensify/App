/**
 * Summarizes what a camera device reports about itself, for the camera-init telemetry span.
 */
import CONST from '@src/CONST';

import type {SpanAttributeValue} from '@sentry/core';
import type {CameraDevice, CameraDeviceFormat} from 'react-native-vision-camera';

type CameraCapabilities = Pick<CameraDevice, 'formats' | 'minFocusDistance' | 'physicalDevices' | 'neutralZoom'>;

/**
 * Whether `candidate` could stand in for `format` with only the autofocus system changing. Framing, low
 * light behavior and frame rate all have to match, otherwise a swap would quietly change the picture and
 * not just how the lens focuses. HDR and depth capture are left out because the receipt camera enables
 * neither, and the stabilization modes because it never selects one.
 */
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

/**
 * The receipt camera picks a format on resolution and aspect ratio alone, so we have no idea which
 * autofocus system it lands on, how close the lens can focus, or whether the device is one that swaps
 * lenses mid-session. None of that is knowable from a simulator, so the device reports it once per
 * camera open and we read it back from the fleet.
 */
function getCameraCapabilityAttributes(device: CameraCapabilities | undefined, format: CameraDeviceFormat | undefined): Record<string, SpanAttributeValue | undefined> {
    if (!device) {
        return {};
    }

    // Undefined while no format is selected yet. False once one is, either because it already focuses by
    // phase detection or because nothing interchangeable with it does.
    let hasInterchangeablePhaseFormat: boolean | undefined;
    if (format) {
        hasInterchangeablePhaseFormat =
            format.autoFocusSystem !== 'phase-detection' && device.formats.some((candidate) => candidate.autoFocusSystem === 'phase-detection' && isInterchangeable(candidate, format));
    }

    return {
        // Together these say whether preferring phase detection could ever change the format we run at,
        // and when it could not, whether that is because the hardware reports no phase-detection format
        // or because none of the ones it reports can stand in for the format we picked.
        [CONST.TELEMETRY.ATTRIBUTE_HAS_INTERCHANGEABLE_PHASE_FORMAT]: hasInterchangeablePhaseFormat,
        [CONST.TELEMETRY.ATTRIBUTE_SELECTED_FORMAT_AF_SYSTEM]: format?.autoFocusSystem,
        [CONST.TELEMETRY.ATTRIBUTE_PHASE_DETECTION_FORMAT_COUNT]: device.formats.filter((candidate) => candidate.autoFocusSystem === 'phase-detection').length,

        // In centimeters. A phone's wide-angle lens stops focusing a few centimeters out, and receipts
        // framed closer than that cannot be brought into focus by any autofocus setting. Vision Camera
        // reports 0 when it cannot read the real value, which must not be recorded as a distance.
        [CONST.TELEMETRY.ATTRIBUTE_MIN_FOCUS_DISTANCE]: device.minFocusDistance > 0 ? device.minFocusDistance : undefined,

        // A virtual device restarts autofocus when it crosses between its physical lenses, so owning more
        // than one lens is what makes that possible at all. The zoom we render at comes along because it
        // differs between phone models and decides which lens we sit on.
        [CONST.TELEMETRY.ATTRIBUTE_PHYSICAL_DEVICE_COUNT]: device.physicalDevices.length,
        [CONST.TELEMETRY.ATTRIBUTE_NEUTRAL_ZOOM]: device.neutralZoom,
    };
}

export default getCameraCapabilityAttributes;
