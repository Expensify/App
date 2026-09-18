import CONST from '@src/CONST';

import type GetVideoResolutionFormatFilter from './types';

// Match the photo target. Otherwise the format selector pairs that photo size with a low video
// resolution and the viewfinder looks grainy.
const getVideoResolutionFormatFilter: GetVideoResolutionFormatFilter = () => ({
    videoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT},
});

export default getVideoResolutionFormatFilter;
