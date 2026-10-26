import type {CapturePhotoSettings, QualityPrioritization} from 'react-native-vision-camera';

/** Camera behavior that differs between iOS and Android. */
type CameraPlatformConfig = {
    scanQualityPrioritization: QualityPrioritization;
    preparedPhotoSettings: CapturePhotoSettings[] | undefined;
    shouldHidePreviewUntilLive: boolean;
    reportsAutoFocusSystem: boolean;
};

export default CameraPlatformConfig;
