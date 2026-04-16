import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import {navigateToStartMoneyRequestStep, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Log from '@libs/Log';
import {getOdometerImageName, getOdometerImageType, getOdometerImageUri} from '@libs/OdometerImageUtils';
import clearOdometerTransactionState from '@libs/OdometerTransactionUtils';
import stitchOdometerImages from '@libs/stitchOdometerImages';
import {cancelSpan, endSpan, startSpan} from '@libs/telemetry/activeSpans';
import {checkIfLocalFileIsAccessible, setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import CONST from '@src/CONST';
import type {IOUAction, IOURequestType, IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type OdometerReceiptStitcherProps = {
    isOdometerDistanceRequest: boolean;
    currentTransactionID: string;
    odometerStartImage: FileObject | string | null | undefined;
    odometerEndImage: FileObject | string | null | undefined;
    transaction: OnyxEntry<Transaction>;
    requestType: IOURequestType | undefined;
    reportID: string;
    backToReport: string | undefined;
    action: IOUAction;
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
    currentTransactionID,
    odometerStartImage,
    odometerEndImage,
    transaction,
    requestType,
    reportID,
    backToReport,
    action,
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
        if (!isOdometerDistanceRequest || !isFocused) {
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

            setMoneyRequestReceipt(
                currentTransactionID,
                getOdometerImageUri(singleImage),
                getOdometerImageName(singleImage),
                shouldUseTransactionDraft(action, iouType),
                getOdometerImageType(singleImage),
            );
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
                    setMoneyRequestReceipt(
                        currentTransactionID,
                        getOdometerImageUri(stitchedImage),
                        getOdometerImageName(stitchedImage),
                        shouldUseTransactionDraft(action, iouType),
                        getOdometerImageType(stitchedImage),
                    );
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

        if (localImages.length > 0) {
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
                    clearOdometerTransactionState(transaction, shouldUseTransactionDraft(action, iouType));
                    if (requestType) {
                        navigateToStartMoneyRequestStep(requestType, iouType, currentTransactionID, reportID, action, backToReport);
                    }
                    return;
                }
                runStitch();
            });
            return;
        }
        runStitch();

        return () => {
            ignore = true;
            cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_IMAGE_STITCH);
        };
    }, [
        isOdometerDistanceRequest,
        isFocused,
        currentTransactionID,
        odometerStartImage,
        odometerEndImage,
        transaction,
        requestType,
        reportID,
        backToReport,
        action,
        translate,
        iouType,
        onStitchingChange,
        onStitchError,
    ]);

    return null;
}

OdometerReceiptStitcher.displayName = 'OdometerReceiptStitcher';

export default OdometerReceiptStitcher;
