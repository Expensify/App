import useOnyx from '@hooks/useOnyx';

import {checkIfLocalFileIsAccessible} from '@libs/actions/IOU/Receipt';
import clearOdometerDraftTransactionState, {hydrateOdometerDraftIntoTransaction} from '@libs/actions/OdometerTransactionUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import {getOdometerImageUri} from '@libs/OdometerUtils';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {useEffect, useRef, useState} from 'react';

type BackupHandledArgs = {
    shouldResetLocalState: boolean;
};

const useRestartOnOdometerImagesFailure = (
    transaction: OnyxEntry<Transaction>,
    reportID: string,
    iouType: IOUType,
    backToReport: string | undefined,
    onBackupHandled?: (args: BackupHandledArgs) => void,
): {hasVerifiedBlobs: boolean} => {
    const [, draftTransactionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [odometerDraft, odometerDraftStatus] = useOnyx(ONYXKEYS.ODOMETER_DRAFT);
    const hasCheckedRef = useRef(false);
    const [asyncVerificationPassed, setAsyncVerificationPassed] = useState(false);

    // Updated via useEffect (not render-time) for React Compiler. The one-render lag is benign:
    // a missed bail just lets recovery fire, and recovery itself rehydrates correctly.
    const transactionRef = useRef(transaction);
    useEffect(() => {
        transactionRef.current = transaction;
    }, [transaction]);

    const hasBlobUrls = (() => {
        if (!transaction) {
            return false;
        }
        const paths = [getOdometerImageUri(transaction.comment?.odometerStartImage), getOdometerImageUri(transaction.comment?.odometerEndImage), transaction.receipt?.source?.toString()];
        return paths.some((path) => !!path && path.startsWith('blob:'));
    })();

    useEffect(() => {
        if (!transaction || isLoadingOnyxValue(draftTransactionsMetadata) || isLoadingOnyxValue(odometerDraftStatus)) {
            return;
        }

        if (hasCheckedRef.current) {
            return;
        }
        hasCheckedRef.current = true;

        const startImage = transaction.comment?.odometerStartImage;
        const endImage = transaction.comment?.odometerEndImage;

        // Source images only — the stitched receipt URL is derived elsewhere from these.
        const urlsToCheck = [
            {
                filename: typeof startImage === 'object' ? startImage?.name : undefined,
                path: getOdometerImageUri(startImage),
                type: typeof startImage === 'object' ? startImage?.type : undefined,
            },
            {
                filename: typeof endImage === 'object' ? endImage?.name : undefined,
                path: getOdometerImageUri(endImage),
                type: typeof endImage === 'object' ? endImage?.type : undefined,
            },
        ].filter(({path}) => !!path && path.startsWith('blob:'));

        // Empty urlsToCheck flows through Promise.all -> [].every(Boolean) === true -> marks verification passed
        // Later blob additions (draft hydration, fresh capture) are minted in this session and stay trusted
        Promise.all(
            urlsToCheck.map(
                ({filename, path, type}) =>
                    new Promise<boolean>((resolve) => {
                        checkIfLocalFileIsAccessible(
                            filename,
                            path,
                            type,
                            () => resolve(true),
                            () => resolve(false),
                        );
                    }),
            ),
        ).then((results) => {
            const canBeRead = results.every(Boolean);
            if (canBeRead) {
                setAsyncVerificationPassed(true);
                return;
            }

            // Bail if another flow already replaced the images (ODOMETER_DRAFT rehydration / fresh capture).
            const liveStartUri = getOdometerImageUri(transactionRef.current?.comment?.odometerStartImage);
            const liveEndUri = getOdometerImageUri(transactionRef.current?.comment?.odometerEndImage);
            if (liveStartUri !== getOdometerImageUri(startImage) || liveEndUri !== getOdometerImageUri(endImage)) {
                setAsyncVerificationPassed(true);
                return;
            }

            // Rehydrate over the dead URLs when a draft exists — clearing first races the destination's
            // auto-hydrator and ends up dropping the wrong URL.
            if (odometerDraft) {
                // Tell the backup hook not to revert on unmount, then re-mint the images from the draft. Only flip
                // verification (and navigate) AFTER the merge lands, else the readings hook snapshots its baseline from
                // the stale dead-blob image and a later swap to the re-minted image reads as a phantom "Discard changes?".
                onBackupHandled?.({shouldResetLocalState: false});
                hydrateOdometerDraftIntoTransaction(transaction.transactionID, odometerDraft, transaction.comment).then(() => {
                    setAsyncVerificationPassed(true);
                    navigateToStartMoneyRequestStep(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, iouType, transaction.transactionID, reportID, CONST.IOU.ACTION.CREATE, backToReport);
                });
                return;
            }

            onBackupHandled?.({shouldResetLocalState: true});
            clearOdometerDraftTransactionState(transaction);

            navigateToStartMoneyRequestStep(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, iouType, transaction.transactionID, reportID, CONST.IOU.ACTION.CREATE, backToReport);
        });
    }, [draftTransactionsMetadata, transaction, iouType, reportID, backToReport, onBackupHandled, odometerDraft, odometerDraftStatus]);

    const isOnyxLoading = isLoadingOnyxValue(draftTransactionsMetadata, odometerDraftStatus);
    const hasVerifiedBlobs = !!transaction && !isOnyxLoading && (!hasBlobUrls || asyncVerificationPassed);

    return {hasVerifiedBlobs};
};

export default useRestartOnOdometerImagesFailure;
