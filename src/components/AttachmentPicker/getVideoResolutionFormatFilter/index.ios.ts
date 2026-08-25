import CONST from '@src/CONST';

import type GetVideoResolutionFormatFilter from './types';

/**
 * On iOS, match the preview resolution to the photo target so the format selector does not pair the
 * photo size with a low video resolution, which would otherwise make the live viewfinder blurry or
 * grainy.
 */
const getVideoResolutionFormatFilter: GetVideoResolutionFormatFilter = () => ({
    videoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT},
});

export default getVideoResolutionFormatFilter;
