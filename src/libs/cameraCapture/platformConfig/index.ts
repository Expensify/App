import type CameraPlatformConfig from './types';

const cameraPlatformConfig: CameraPlatformConfig = {
    scanQualityPrioritization: 'balanced',
    preparedPhotoSettings: undefined,
    shouldHidePreviewUntilLive: false,
    // VisionCamera hard-codes 'phase-detection' on Android.
    reportsAutoFocusSystem: false,
    canLightFlashWithTorch: true,
};

export default cameraPlatformConfig;
