import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {checkIfLocalFileIsAccessible} from '@libs/actions/IOU/Receipt';
import clearOdometerDraftTransactionState from '@libs/actions/OdometerTransactionUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import {getOdometerImageUri} from '@libs/OdometerImageUtils';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

// When the component mounts, if there are odometer images or a stitched receipt, see if the files can be read from the disk.
// If not, redirect the user to the starting step of the flow.
// This is because until the request is saved, the image files are only stored in the browser's memory as blob:// URLs
// and if the browser is refreshed, then the images cease to exist.
// The best way for the user to recover from this is to start over from the start of the request process.
const useRestartOnOdometerImagesFailure = (transaction: OnyxEntry<Transaction>, reportID: string, iouType: IOUType, backToReport: string | undefined, onBackupHandled?: () => void) => {
    const [, draftTransactionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const hasCheckedRef = useRef(false);

    useEffect(() => {
        if (!transaction || isLoadingOnyxValue(draftTransactionsMetadata)) {
            return;
        }

        // Run only once after Onyx finishes loading — blob:// URLs are ephemeral and only need
        // to be verified on the first render after the data is available.
        // It has to be resolved this way in order to have a complete dependency array for the useEffect hook.
        if (hasCheckedRef.current) {
            return;
        }
        hasCheckedRef.current = true;

        const startImage = transaction.comment?.odometerStartImage;
        const endImage = transaction.comment?.odometerEndImage;
        const stitchedUri = transaction.receipt?.source?.toString();

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
            {
                filename: transaction.receipt?.filename,
                path: stitchedUri,
                type: undefined,
            },
        ].filter(({path}) => !!path && path.startsWith('blob:'));

        if (urlsToCheck.length === 0) {
            return;
        }

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
                return;
            }

            onBackupHandled?.();
            clearOdometerDraftTransactionState(transaction);
            navigateToStartMoneyRequestStep(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, iouType, transaction.transactionID, reportID, CONST.IOU.ACTION.CREATE, backToReport);
        });
    }, [draftTransactionsMetadata, transaction, iouType, reportID, backToReport, onBackupHandled]);
};

export default useRestartOnOdometerImagesFailure;
