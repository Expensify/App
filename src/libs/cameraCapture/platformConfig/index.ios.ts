import type CameraPlatformConfig from './types';

const cameraPlatformConfig: CameraPlatformConfig = {
    scanQualityPrioritization: 'speed',
    preparedPhotoSettings: [{flashMode: 'off', enableShutterSound: false}],
    shouldHidePreviewUntilLive: true,
    reportsAutoFocusSystem: true,
};

export default cameraPlatformConfig;
