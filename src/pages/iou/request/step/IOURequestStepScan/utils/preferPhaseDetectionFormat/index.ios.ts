/**
 * Upgrades an already chosen camera format to a phase-detection equivalent where the device has one.
 */
import type PreferPhaseDetectionFormat from './types';

// This can't be a format filter. `useCameraFormat` scores filters additively, so adding one changes the
// weights of the rest and can flip a resolution or aspect ratio match. Running after selection keeps
// that choice, and matching on dimensions and frame rate means the swap only changes the autofocus
// system.
const preferPhaseDetectionFormat: PreferPhaseDetectionFormat = ({device, format}) => {
    if (!device || !format || format.autoFocusSystem === 'phase-detection') {
        return format;
    }

    const equivalentPhaseDetectionFormat = device.formats.find(
        (candidate) =>
            candidate.autoFocusSystem === 'phase-detection' &&
            candidate.photoWidth === format.photoWidth &&
            candidate.photoHeight === format.photoHeight &&
            candidate.videoWidth === format.videoWidth &&
            candidate.videoHeight === format.videoHeight &&
            candidate.minFps === format.minFps &&
            candidate.maxFps === format.maxFps,
    );

    return equivalentPhaseDetectionFormat ?? format;
};

export default preferPhaseDetectionFormat;
