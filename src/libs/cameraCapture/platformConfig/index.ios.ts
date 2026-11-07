import type CameraPlatformConfig from './types';

const cameraPlatformConfig: CameraPlatformConfig = {
    scanQualityPrioritization: 'speed',
    // Must match the plain portrait scan's capture settings exactly, or iOS skips the prepared pipeline.
    preparedPhotoSettings: [{flashMode: 'off', enableShutterSound: false, enableVirtualDeviceFusion: false}],
    shouldHidePreviewUntilLive: true,
    reportsAutoFocusSystem: true,
    // VisionCamera v5 has no snapshot on iOS, so a torch-lit capture would still be a full photo.
    canLightFlashWithTorch: false,
};

export default cameraPlatformConfig;
