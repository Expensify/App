/**
 * Builds the filter list that picks which camera format the receipt scanner runs at.
 */
import CONST from '@src/CONST';

import type GetReceiptCameraFormatFilters from './types';

// Prioritize photoResolution so the format selector picks the configured PHOTO_WIDTH/PHOTO_HEIGHT
// format. videoResolution keeps screen dimensions because `takeSnapshot` is a GPU screenshot of the
// preview surface and doesn't depend on video resolution. Constraining it to screen size avoids
// burning GPU on a higher-than-needed preview.
const getReceiptCameraFormatFilters: GetReceiptCameraFormatFilters = ({windowWidth, windowHeight}) => [
    {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
    {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
    {videoResolution: {width: windowHeight, height: windowWidth}},
];

export default getReceiptCameraFormatFilters;
