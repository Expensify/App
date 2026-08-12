import {getOdometerImageName, getOdometerImageType, getOdometerImageUri} from '@libs/OdometerUtils';

import type {FileObject} from '@src/types/utils/Attachment';

type OdometerReceiptDerivation =
    | {mode: 'empty'}
    | {mode: 'single'; uri: string; name: string; type: string | undefined}
    | {mode: 'stitch'; startImage: FileObject | string; endImage: FileObject | string};

/**
 * Pure function that decides how the displayed receipt should be derived from a pair of odometer images.
 *
 * - `empty`: neither image present. Caller should clear (or leave alone, if already empty) the receipt slot.
 * - `single`: exactly one image present. Caller can write the result directly via `setMoneyRequestReceipt`.
 *   The `name` falls back to 'odometer.jpg' when the image has no name - `validateReceiptFile` rejects
 *   receipts without a filename.
 * - `stitch`: both images present. Caller should run them through `stitchTask` to produce the receipt.
 */
function deriveOdometerReceipt(startImage: FileObject | string | null | undefined, endImage: FileObject | string | null | undefined): OdometerReceiptDerivation {
    if (startImage && endImage) {
        return {mode: 'stitch', startImage, endImage};
    }

    const singleImage = startImage ?? endImage;
    if (!singleImage) {
        return {mode: 'empty'};
    }

    return {
        mode: 'single',
        uri: getOdometerImageUri(singleImage),
        name: getOdometerImageName(singleImage) || 'odometer.jpg',
        type: getOdometerImageType(singleImage),
    };
}

export type {OdometerReceiptDerivation};
export default deriveOdometerReceipt;
