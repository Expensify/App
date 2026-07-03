import CONST from '@src/CONST';

import {Platform} from 'react-native';
import ImageSize from 'react-native-image-size';

type BoundedResize = {width: number} | {height: number};

/**
 * Returns a resize action that bounds the longest side of an image with the given dimensions to
 * `CONST.MAX_IMAGE_DIMENSION`, or `undefined` when it already fits within that budget (so we never
 * upscale). Resizing with only one side preserves the aspect ratio, so bounding the longer side is enough.
 *
 * The cap exists to keep `ImageManipulator`'s `renderAsync()` from materializing an oversized bitmap
 * (`width × height × 4` bytes) in one contiguous native buffer. On iOS HybridApp — where NewDot shares a
 * single jetsam memory budget with the resident OldDot — a large decode is exactly the allocation that
 * triggers the `std::bad_alloc` OOM crash. It is a no-op off iOS, leaving other platforms untouched.
 */
function getBoundedResizeForDimensions(width: number, height: number): BoundedResize | undefined {
    // The OOM is specific to iOS HybridApp's shared jetsam budget, so we only cap there (per the issue
    // owner's guidance on #93846).
    if (Platform.OS !== 'ios') {
        return undefined;
    }

    if (Math.max(width, height) <= CONST.MAX_IMAGE_DIMENSION) {
        return undefined;
    }

    return width >= height ? {width: CONST.MAX_IMAGE_DIMENSION} : {height: CONST.MAX_IMAGE_DIMENSION};
}

/**
 * Reads the source dimensions of the image at `uri` and returns the bounding resize action to apply
 * before `renderAsync()` (see `getBoundedResizeForDimensions`). If the dimensions can't be read we fall
 * back to no resize rather than blocking the decode.
 */
function getBoundedImageResize(uri: string): Promise<BoundedResize | undefined> {
    if (Platform.OS !== 'ios') {
        return Promise.resolve(undefined);
    }

    return ImageSize.getSize(uri)
        .then(({width, height}) => getBoundedResizeForDimensions(width, height))
        .catch(() => undefined);
}

export {getBoundedResizeForDimensions};
export default getBoundedImageResize;
