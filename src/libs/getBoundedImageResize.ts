import {Platform} from 'react-native';
import ImageSize from 'react-native-image-size';
import CONST from '@src/CONST';

type BoundedResize = {width: number} | {height: number};

/**
 * Returns a resize action that bounds the image's longest side to `CONST.MAX_IMAGE_DIMENSION`,
 * or `undefined` when the image already fits within that budget (so we never upscale).
 *
 * This is meant to be applied before `ImageManipulator`'s `renderAsync()`, which otherwise
 * materializes the full-resolution source bitmap (`width × height × 4` bytes) in one contiguous
 * native buffer. On iOS HybridApp — where NewDot shares a single jetsam memory budget with the
 * resident OldDot — a large (e.g. 48MP HEIC) decode is exactly the allocation that triggers the
 * `std::bad_alloc` OOM crash. Capping the decode dimensions keeps the bitmap within the pixel
 * budget the app already defines elsewhere.
 *
 * Resizing with only one side preserves the aspect ratio, so bounding the longer side is enough.
 * If the source dimensions can't be read we fall back to no resize rather than blocking the decode.
 */
function getBoundedImageResize(uri: string): Promise<BoundedResize | undefined> {
    // The OOM is specific to iOS HybridApp's shared jetsam budget, so we only cap the decode there
    // and leave other platforms untouched (per the issue owner's guidance on #93846).
    if (Platform.OS !== 'ios') {
        return Promise.resolve(undefined);
    }

    return ImageSize.getSize(uri)
        .then(({width, height}): BoundedResize | undefined => {
            if (Math.max(width, height) <= CONST.MAX_IMAGE_DIMENSION) {
                return undefined;
            }
            return width >= height ? {width: CONST.MAX_IMAGE_DIMENSION} : {height: CONST.MAX_IMAGE_DIMENSION};
        })
        .catch(() => undefined);
}

export default getBoundedImageResize;
