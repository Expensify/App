import type {FileObject} from '@src/types/utils/Attachment';

/**
 * Merges two odometer images into a single image using react-native-view-shot.
 *
 * NOTE: This function is not used directly on native. Instead, the merging logic
 * is handled in useOdometerImageMerging hook, which uses ImageMergeViewShot component.
 *
 * This stub exists to maintain the same API as the web version.
 *
 * @param startImageUri - The start odometer image URI (string on native)
 * @param endImageUri - The end odometer image URI (string on native)
 * @returns Promise that rejects (should not be called directly on native)
 */
function mergeImages(_startImageUri: string, _endImageUri: string): Promise<FileObject> {
    return Promise.reject(new Error('mergeImages should not be called directly on native. Use useOdometerImageMerging hook instead, which handles ViewShot rendering.'));
}

export default mergeImages;
