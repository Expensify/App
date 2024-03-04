type Callback = (response: ImagePickerResponse) => void;
type OptionsCommon = {
    mediaType: MediaType;
    maxWidth?: number;
    maxHeight?: number;
    quality?: PhotoQuality;
    videoQuality?: AndroidVideoOptions | IOSVideoOptions;
    includeBase64?: boolean;
    includeExtra?: boolean;
    presentationStyle?: 'currentContext' | 'fullScreen' | 'pageSheet' | 'formSheet' | 'popover' | 'overFullScreen' | 'overCurrentContext';
};
type ImageLibraryOptions = OptionsCommon & {
    selectionLimit?: number;
};
type CameraOptions = OptionsCommon & {
    durationLimit?: number;
    saveToPhotos?: boolean;
    cameraType?: CameraType;
};
type Asset = {
    base64?: string;
    uri?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    type?: string;
    fileName?: string;
    duration?: number;
    bitrate?: number;
    timestamp?: string;
    id?: string;
};
type ImagePickerResponse = {
    didCancel?: boolean;
    errorCode?: ErrorCode;
    errorMessage?: string;
    assets?: Asset[];
};
type PhotoQuality = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
type CameraType = 'back' | 'front';
type MediaType = 'photo' | 'video' | 'mixed';
type AndroidVideoOptions = 'low' | 'high';
type IOSVideoOptions = 'low' | 'medium' | 'high';
type ErrorCode = 'camera_unavailable' | 'permission' | 'others';
class ErrorLaunchCamera extends Error {
    errorCode: ErrorCode;

    constructor(message: string, errorCode: ErrorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
export {ErrorLaunchCamera};
export type {CameraOptions, Callback, ErrorCode, ImagePickerResponse, Asset, ImageLibraryOptions};
