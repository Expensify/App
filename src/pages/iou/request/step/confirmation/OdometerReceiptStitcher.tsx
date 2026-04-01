import {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import {getMimeTypeFromUri} from '@libs/fileDownload/FileUtils';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import stitchOdometerImages from '@libs/stitchOdometerImages';
import {setMoneyRequestReceipt} from '@userActions/IOU';
import type {IOUAction, IOUType} from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

type OdometerReceiptStitcherProps = {
    isOdometerDistanceRequest: boolean;
    currentTransactionID: string;
    odometerStartImage: FileObject | string | null | undefined;
    odometerEndImage: FileObject | string | null | undefined;
    action: IOUAction;
    iouType: IOUType;
    onStitchingChange: (isStitching: boolean) => void;
    onStitchError: (error: string) => void;
};

/**
 * Side-effect-only component that stitches two odometer images into a single
 * receipt, or sets a single odometer image as the receipt when only one exists.
 */
function OdometerReceiptStitcher({
    isOdometerDistanceRequest,
    currentTransactionID,
    odometerStartImage,
    odometerEndImage,
    action,
    iouType,
    onStitchingChange,
    onStitchError,
}: OdometerReceiptStitcherProps) {
    const {translate} = useLocalize();

    useEffect(() => {
        if (!isOdometerDistanceRequest) {
            return;
        }

        const getImageUri = (img: FileObject | string | null | undefined): string => (typeof img === 'string' ? img : (img?.uri ?? ''));
        const getImageName = (img: FileObject | string | null | undefined): string => (typeof img === 'string' ? (img.split('/').pop() ?? '') : (img?.name ?? ''));
        const getImageType = (img: FileObject | string | null | undefined): string | undefined =>
            typeof img === 'string' ? getMimeTypeFromUri(img) : (img?.type ?? getMimeTypeFromUri(img?.uri ?? ''));

        if (!odometerStartImage || !odometerEndImage) {
            const singleImage = odometerStartImage ?? odometerEndImage;

            if (!singleImage) {
                return;
            }

            setMoneyRequestReceipt(currentTransactionID, getImageUri(singleImage), getImageName(singleImage), shouldUseTransactionDraft(action, iouType), getImageType(singleImage));
            return;
        }

        let ignore = false;
        onStitchingChange(true);
        onStitchError('');

        stitchOdometerImages(odometerStartImage, odometerEndImage)
            .then((stitchedImage) => {
                if (ignore || !stitchedImage) {
                    return;
                }
                setMoneyRequestReceipt(
                    currentTransactionID,
                    getImageUri(stitchedImage),
                    getImageName(stitchedImage),
                    shouldUseTransactionDraft(action, iouType),
                    getImageType(stitchedImage),
                );
            })
            .catch((error: unknown) => {
                if (ignore) {
                    return;
                }
                Log.warn('stitchOdometerImages failed', {error});
                onStitchError(translate('iou.error.stitchOdometerImagesFailed'));
            })
            .finally(() => {
                if (ignore) {
                    return;
                }
                onStitchingChange(false);
            });

        return () => {
            ignore = true;
        };
    }, [isOdometerDistanceRequest, currentTransactionID, odometerStartImage, odometerEndImage, action, translate, iouType, onStitchingChange, onStitchError]);

    return null;
}

OdometerReceiptStitcher.displayName = 'OdometerReceiptStitcher';

export default OdometerReceiptStitcher;
