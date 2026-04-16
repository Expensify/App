import {useEffect} from 'react';
import {Platform} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {removeMoneyRequestOdometerImage, setMoneyRequestOdometerReading} from '@libs/actions/IOU';
import {checkIfLocalFileIsAccessible, setMoneyRequestReceipt} from '@libs/actions/IOU/Receipt';
import {removeDraftTransactionsByIDs} from '@libs/actions/TransactionEdit';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import {getOdometerImageUri} from '@libs/OdometerImageUtils';
import {getRequestType} from '@libs/TransactionUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';
import type {Transaction} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useOnyx from './useOnyx';

function clearOdometerTransactionState(transaction: OnyxEntry<Transaction>, isDraft: boolean): void {
    if (!transaction) {
        return;
    }
    setMoneyRequestReceipt(transaction.transactionID, '', '', isDraft);
    setMoneyRequestOdometerReading(transaction.transactionID, null, null, isDraft);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.START, isDraft, true);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.END, isDraft, true);
    removeDraftTransactionsByIDs([transaction.transactionID], true);
}

// When the component mounts, if there are odometer images or a stitched receipt, see if the files can be read from the disk.
// If not, redirect the user to the starting step of the flow.
// This is because until the request is saved, the image files are only stored in the browser's memory as blob:// URLs
// and if the browser is refreshed, then the images cease to exist.
// The best way for the user to recover from this is to start over from the start of the request process.
const useRestartOnOdometerImagesFailure = (transaction: OnyxEntry<Transaction>, reportID: string, iouType: IOUType, action: IOUAction) => {
    const [, draftTransactionsMetadata] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    useEffect(() => {
        if (Platform.OS !== 'web' || !transaction || action !== CONST.IOU.ACTION.CREATE || isLoadingOnyxValue(draftTransactionsMetadata)) {
            return;
        }


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

        let canBeRead = true;

        Promise.all(
            urlsToCheck.map(({filename, path, type}) =>
                checkIfLocalFileIsAccessible(
                    filename,
                    path,
                    type,
                    () => {},
                    () => {
                        canBeRead = false;
                    },
                ),
            ),
        )?.then(() => {
            if (canBeRead) {
                return;
            }

            clearOdometerTransactionState(transaction, true);
            navigateToStartMoneyRequestStep(CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER, iouType, transaction.transactionID, reportID);
        });

        // We want this hook to run once after Onyx finishes loading the draft transactions
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftTransactionsMetadata]);
};

export {clearOdometerTransactionState};
export default useRestartOnOdometerImagesFailure;
