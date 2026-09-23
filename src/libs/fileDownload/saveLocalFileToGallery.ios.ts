import {CameraRoll} from '@react-native-camera-roll/camera-roll';

/** Saves to the iOS camera roll with no alert (callers own user feedback). iOS prompts for permission itself on first write. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- fileName/mimeType are unused on iOS, kept for parity with the Android implementation
function saveLocalFileToGallery(localPath: string, fileName?: string, mimeType?: string): Promise<void> {
    return CameraRoll.saveAsset(localPath).then(() => undefined);
}

export default saveLocalFileToGallery;
