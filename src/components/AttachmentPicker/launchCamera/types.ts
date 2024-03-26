/**
 * A callback function used to handle the response from the image picker.
 *
 * @param response - The response object containing information about the picked images or any errors encountered.
 */
type Callback = (response: ImagePickerResponse) => void;

type OptionsCommon = {
    /** Specifies the type of media to be captured. */
    mediaType: MediaType;
    /** Specifies the maximum width of the media to be captured. */
    maxWidth?: number;
    /** Specifies the maximum height of the media to be captured. */
    maxHeight?: number;
    /** Specifies the quality of the photo to be captured. */
    quality?: PhotoQuality;
    /** Specifies the video quality for video capture. */
    videoQuality?: AndroidVideoOptions | IOSVideoOptions;
    /** Specifies whether to include the media in base64 format. */
    includeBase64?: boolean;
    /** Specifies whether to include extra information about the captured media. */
    includeExtra?: boolean;
    /** Specifies the presentation style for the media picker. */
    presentationStyle?: 'currentContext' | 'fullScreen' | 'pageSheet' | 'formSheet' | 'popover' | 'overFullScreen' | 'overCurrentContext';
};

type ImageLibraryOptions = OptionsCommon & {
    /** Specifies the maximum number of images that can be selected from the library. */
    selectionLimit?: number;
};

type CameraOptions = OptionsCommon & {
    /** Specifies the maximum duration limit. */
    durationLimit?: number;
    /** Specifies whether to save captured media. */
    saveToPhotos?: boolean;
    /** Specifies the type of camera to be used. */
    cameraType?: CameraType;
};

type Asset = {
    /** Base64 representation of the asset. */
    base64?: string;
    /** URI pointing to the asset. */
    uri?: string;
    /** Width of the asset. */
    width?: number;
    /** Height of the asset. */
    height?: number;
    /** Size of the asset file in bytes. */
    fileSize?: number;
    /** Type of the asset. */
    type?: string;
    /** Name of the asset file. */
    fileName?: string;
    /** Duration of the asset. */
    duration?: number;
    /** Bitrate of the asset. */
    bitrate?: number;
    /** Timestamp of when the asset was created or modified. */
    timestamp?: string;
    /** ID of the asset. */
    id?: string;
};

type ImagePickerResponse = {
    /** Indicates whether the image picker operation was canceled. */
    didCancel?: boolean;
    /** The error code, if an error occurred during the image picking process. */
    errorCode?: ErrorCode;
    /** A descriptive error message, if an error occurred during the image picking process. */
    errorMessage?: string;
    /** An array of assets representing the picked images. */
    assets?: Asset[];
};

/** Represents the quality options. */
type PhotoQuality = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

/** Represents the type of camera to be used. */
type CameraType = 'back' | 'front';

/** Represents the type of media to be captured. */
type MediaType = 'photo' | 'video' | 'mixed';

/** Represents the quality options for video capture on Android devices. */
type AndroidVideoOptions = 'low' | 'high';

/** Represents the quality options for video capture on iOS devices. */
type IOSVideoOptions = 'low' | 'medium' | 'high';

/** Represents various error codes that may occur during camera operations. */
type ErrorCode = 'camera_unavailable' | 'permission' | 'others';

class ErrorLaunchCamera extends Error {
    /** The error code associated with the error. */
    errorCode: ErrorCode;

    constructor(message: string, errorCode: ErrorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}

/**
 * A function used to launch the camera with specified options and handle the callback.
 *
 * @param options - The options for the camera, specifying various settings.
 * @param callback - The callback function to handle the response from the camera operation.
 */
type LaunchCamera = (options: CameraOptions, callback: Callback) => void;

export {ErrorLaunchCamera};
export type {CameraOptions, Callback, ErrorCode, ImagePickerResponse, Asset, ImageLibraryOptions, LaunchCamera};
