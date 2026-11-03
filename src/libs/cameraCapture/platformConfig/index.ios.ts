import type CameraPlatformConfig from './types';

const cameraPlatformConfig: CameraPlatformConfig = {
    scanQualityPrioritization: 'speed',
    preparedPhotoSettings: [{flashMode: 'off', enableShutterSound: false}],
    shouldHidePreviewUntilLive: true,
    reportsAutoFocusSystem: true,
    // VisionCamera v5 has no snapshot on iOS, so a torch-lit capture would still be a full photo.
    canLightFlashWithTorch: false,
};

export default cameraPlatformConfig;
