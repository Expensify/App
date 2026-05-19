import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import {getOdometerImageUri} from '@libs/OdometerImageUtils';
import {deriveOdometerReceipt, stitchTask} from '@libs/OdometerReceipt';
import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import type {Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type OdometerReceiptStitcherProps = {
    isOdometerDistanceRequest: boolean;
    odometerStartImage: FileObject | string | null | undefined;
    odometerEndImage: FileObject | string | null | undefined;
    transaction: OnyxEntry<Transaction>;
    hasVerifiedBlobs: boolean;
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
    hasVerifiedBlobs,
    onStitchingChange,
    onStitchError,
}: OdometerReceiptStitcherProps) {
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const lastStitchedImages = useRef<{
        startImage: FileObject | string | null | undefined;
        endImage: FileObject | string | null | undefined;
    } | null>(null);
    // Self-heal against external clears (e.g. ReceiptFileValidator).
    const lastWrittenReceiptSource = useRef<string | null>(null);

    useEffect(() => {
        // Wait until useRestartOnOdometerImagesFailure has confirmed the blob URLs are still
        // readable. Stitching a dead blob after a browser refresh would race with that hook's
        // redirect and leave the UI stuck on the E screen
        if (!isOdometerDistanceRequest || !isFocused || !transaction || !hasVerifiedBlobs) {
            return;
        }

        // Skip stitching when source images haven't changed (compare by URI not reference
        // because Onyx may create new object instances when restoring a backup transaction)
        // and the receipt source still matches what we last wrote.
        const startUri = getOdometerImageUri(odometerStartImage);
        const endUri = getOdometerImageUri(odometerEndImage);
        const currentReceiptSource = transaction.receipt?.source?.toString() ?? '';
        if (
            lastStitchedImages.current !== null &&
            getOdometerImageUri(lastStitchedImages.current.startImage) === startUri &&
            getOdometerImageUri(lastStitchedImages.current.endImage) === endUri &&
            lastWrittenReceiptSource.current === currentReceiptSource
        ) {
            return;
        }

        const derivation = deriveOdometerReceipt(odometerStartImage, odometerEndImage);

        if (derivation.mode === 'empty') {
            // Skip the clear on fresh transactions - otherwise we'd write an empty receipt object onto them.
            if (transaction.receipt?.source) {
                setMoneyRequestReceipt(transaction.transactionID, '', '', true, '');
            }
            lastStitchedImages.current = {startImage: odometerStartImage, endImage: odometerEndImage};
            lastWrittenReceiptSource.current = '';
            return;
        }

        if (derivation.mode === 'single') {
            setMoneyRequestReceipt(transaction.transactionID, derivation.uri, derivation.name, true, derivation.type);
            lastStitchedImages.current = {startImage: odometerStartImage, endImage: odometerEndImage};
            lastWrittenReceiptSource.current = derivation.uri;
            return;
        }

        const controller = new AbortController();
        onStitchingChange(true);
        onStitchError('');

        stitchTask({startImage: derivation.startImage, endImage: derivation.endImage, signal: controller.signal})
            .then((result) => {
                if (controller.signal.aborted) {
                    return;
                }
                setMoneyRequestReceipt(transaction.transactionID, result.uri, result.name, true, result.type);
                lastStitchedImages.current = {startImage: odometerStartImage, endImage: odometerEndImage};
                lastWrittenReceiptSource.current = result.uri;
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }
                Log.warn('stitchOdometerImages failed', {error});
                onStitchError(translate('iou.error.stitchOdometerImagesFailed'));
            })
            .finally(() => {
                if (controller.signal.aborted) {
                    return;
                }
                onStitchingChange(false);
            });

        return () => {
            controller.abort();
            onStitchingChange(false);
        };
    }, [isOdometerDistanceRequest, isFocused, odometerStartImage, odometerEndImage, transaction, hasVerifiedBlobs, translate, onStitchingChange, onStitchError]);

    return null;
}

OdometerReceiptStitcher.displayName = 'OdometerReceiptStitcher';

export default OdometerReceiptStitcher;
