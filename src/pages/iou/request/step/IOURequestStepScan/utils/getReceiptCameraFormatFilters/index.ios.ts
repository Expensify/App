/**
 * Builds the filter list that picks which camera format the receipt scanner runs at.
 */
import CONST from '@src/CONST';

import type GetReceiptCameraFormatFilters from './types';

// Prioritize photoResolution so the format selector picks the configured PHOTO_WIDTH/PHOTO_HEIGHT
// format. videoResolution matches the photo target because `takeSnapshot` reads from the video
// pipeline, so a smaller video resolution would degrade the snapshot capture quality.
const getReceiptCameraFormatFilters: GetReceiptCameraFormatFilters = () => [
    {photoAspectRatio: CONST.RECEIPT_CAMERA.PHOTO_ASPECT_RATIO},
    {photoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
    {videoResolution: {width: CONST.RECEIPT_CAMERA.PHOTO_WIDTH, height: CONST.RECEIPT_CAMERA.PHOTO_HEIGHT}},
];

export default getReceiptCameraFormatFilters;
