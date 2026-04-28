import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import clearOdometerDraftTransactionState from '@libs/actions/OdometerTransactionUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {getOdometerImageName, getOdometerImageType, getOdometerImageUri} from '@libs/OdometerImageUtils';
import stitchOdometerImages from '@libs/stitchOdometerImages';
import {cancelSpan, endSpan, startSpan} from '@libs/telemetry/activeSpans';
import {checkIfLocalFileIsAccessible, setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type OdometerReceiptStitcherProps = {
    isOdometerDistanceRequest: boolean;
    odometerStartImage: FileObject | string | null | undefined;
    odometerEndImage: FileObject | string | null | undefined;
    transaction: OnyxEntry<Transaction>;
    reportID: string;
    backToReport: string | undefined;
    iouType: IOUType;
    onStitchingChange: (isStitching: boolean) => void;
    onStitchError: (error: string) => void;
};

/**
 * Side-effect-only component that stitches two odometer images into a single
 * receipt, or sets a single odometer image as the receipt when only one exists.
 * Skips stitching when source images haven't changed (compares by URI, not reference,
 * because Onyx may create new object instances when restoring a backup transaction).
 */
function OdometerReceiptStitcher({
    isOdometerDistanceRequest,
    odometerStartImage,
    odometerEndImage,
    transaction,
    reportID,
    backToReport,
    iouType,
    onStitchingChange,
    onStitchError,
}: OdometerReceiptStitcherProps) {
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const lastStitchedImages = useRef<{
        startImage: FileObject | string | null | undefined;
        endImage: FileObject | string | null | undefined;
    } | null>(null);

    useEffect(() => {
        if (!isOdometerDistanceRequest || !isFocused || !transaction) {
            return;
        }

        // Skip stitching when source images haven't changed (compare by URI not reference
        // because Onyx may create new object instances when restoring a backup transaction)
        const startUri = getOdometerImageUri(odometerStartImage);
        const endUri = getOdometerImageUri(odometerEndImage);
        if (
            lastStitchedImages.current !== null &&
            getOdometerImageUri(lastStitchedImages.current.startImage) === startUri &&
            getOdometerImageUri(lastStitchedImages.current.endImage) === endUri
        ) {
            return;
        }

        if (!odometerStartImage || !odometerEndImage) {
            const singleImage = odometerStartImage ?? odometerEndImage;

            if (!singleImage) {
                return;
            }

            setMoneyRequestReceipt(transaction.transactionID, getOdometerImageUri(singleImage), getOdometerImageName(singleImage), true, getOdometerImageType(singleImage));
            lastStitchedImages.current = {startImage: odometerStartImage, endImage: odometerEndImage};
            return;
        }

        let ignore = false;
        onStitchingChange(true);
        onStitchError('');

        const runStitch = () => {
            startSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH, {
                name: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH,
                op: CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH,
            });

            stitchOdometerImages(odometerStartImage, odometerEndImage)
                .then((stitchedImage) => {
                    if (ignore || !stitchedImage) {
                        cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH);
                        return;
                    }
                    setMoneyRequestReceipt(transaction.transactionID, getOdometerImageUri(stitchedImage), getOdometerImageName(stitchedImage), true, getOdometerImageType(stitchedImage));
                    lastStitchedImages.current = {startImage: odometerStartImage, endImage: odometerEndImage};
                    endSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH);
                })
                .catch((error: unknown) => {
                    cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH);
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
        };

        // Pre-flight: verify blob URLs haven't expired before attempting to stitch.
        const localImages = [
            {uri: startUri, image: odometerStartImage},
            {uri: endUri, image: odometerEndImage},
        ].filter((item): item is {uri: string; image: typeof odometerStartImage} => !!item.uri && item.uri.startsWith('blob:'));

        let hasExpiredImages = false;
        Promise.all(
            localImages.map(({uri, image}) =>
                checkIfLocalFileIsAccessible(
                    getOdometerImageName(image),
                    uri,
                    typeof image === 'object' ? image?.type : undefined,
                    () => {},
                    () => {
                        hasExpiredImages = true;
                    },
                ),
            ),
        ).then(() => {
            if (ignore) {
                return;
            }
            if (hasExpiredImages) {
                onStitchingChange(false);
                clearOdometerDraftTransactionState(transaction);
                navigateToStartMoneyRequestStep(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, iouType, transaction.transactionID, reportID, CONST.IOU.ACTION.CREATE, backToReport);
                return;
            }
            runStitch();
        });

        return () => {
            ignore = true;
            onStitchingChange(false);
            cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH);
        };
    }, [isOdometerDistanceRequest, isFocused, odometerStartImage, odometerEndImage, transaction, reportID, backToReport, translate, iouType, onStitchingChange, onStitchError]);

    return null;
}

OdometerReceiptStitcher.displayName = 'OdometerReceiptStitcher';

export default OdometerReceiptStitcher;
