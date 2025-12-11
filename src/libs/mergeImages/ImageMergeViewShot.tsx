import type {FileObject} from '@src/types/utils/Attachment';

type ImageMergeViewShotProps = {
    startImageUri: string;
    endImageUri: string;
    isHorizontal: boolean;
    scaledWidth1: number;
    scaledWidth2: number;
    scaledHeight: number;
    totalWidth: number;
    totalHeight: number;
    onCapture: (fileObject: FileObject) => void;
    onError: (error: Error) => void;
};

/**
 * Web stub for ImageMergeViewShot.
 * This component should never be used on web - image merging on web is handled
 * directly in useOdometerImageMerging hook using canvas API.
 */
function ImageMergeViewShot() {
    // This component should never be rendered on web
    // If it is, it means there's a bug in the code
    return null;
}

export default ImageMergeViewShot;
