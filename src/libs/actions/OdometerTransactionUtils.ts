import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import revokeOdometerImageUri from '@libs/OdometerImageUtils';
import CONST from '@src/CONST';
import type {OdometerImageType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import {setMoneyRequestReceipt} from './IOU/Receipt';
import {removeBackupTransaction} from './TransactionEdit';

/**
 * Set the odometer readings for a transaction
 */
function setMoneyRequestOdometerReading(transactionID: string, startReading: number | null, endReading: number | null, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            odometerStart: startReading,
            odometerEnd: endReading,
        },
    });
}

/**
 * Set odometer image for a transaction
 * @param transaction - The transaction or transaction draft
 * @param imageType - 'start' or 'end'
 * @param file - The image file (File object on web, URI string on native)
 * @param isDraft - Whether this is a draft transaction
 * @param shouldRevokeOldImage - Whether to revoke the previous blob URL immediately (always false on native where blob URLs don't exist; false on web when a backup transaction exists making the caller responsible for revoking)
 */
function setMoneyRequestOdometerImage(transaction: OnyxEntry<Transaction>, imageType: OdometerImageType, file: FileObject | string, isDraft: boolean, shouldRevokeOldImage: boolean) {
    const imageKey = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? 'odometerStartImage' : 'odometerEndImage';
    const normalizedFile: FileObject | string =
        typeof file === 'string'
            ? file
            : {
                  uri: file.uri ?? (typeof URL !== 'undefined' ? URL.createObjectURL(file as Blob) : undefined),
                  name: file.name,
                  type: file.type,
                  size: file.size,
              };
    const transactionID = transaction?.transactionID;
    const existingImage = transaction?.comment?.[imageKey];
    if (shouldRevokeOldImage) {
        revokeOdometerImageUri(existingImage, normalizedFile);
    }
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            [imageKey]: normalizedFile,
        },
    });
}

/**
 * Remove odometer image from a transaction
 * @param transaction - The transaction or transaction draft
 * @param imageType - 'start' or 'end'
 * @param isDraft - Whether this is a draft transaction
 * @param shouldRevokeOldImage - Whether to revoke the previous blob URL immediately (always false on native where blob URLs don't exist; false on web when a backup transaction exists making the caller responsible for revoking)
 */
function removeMoneyRequestOdometerImage(transaction: OnyxEntry<Transaction>, imageType: OdometerImageType, isDraft: boolean, shouldRevokeOldImage: boolean) {
    if (!transaction?.transactionID) {
        return;
    }
    const imageKey = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? 'odometerStartImage' : 'odometerEndImage';
    const existingImage = transaction?.comment?.[imageKey];
    if (shouldRevokeOldImage) {
        revokeOdometerImageUri(existingImage);
    }
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, {
        comment: {
            [imageKey]: null,
        },
    });
}

function clearOdometerDraftTransactionState(transaction: OnyxEntry<Transaction>): void {
    if (!transaction) {
        return;
    }
    setMoneyRequestReceipt(transaction.transactionID, '', '', true);
    setMoneyRequestOdometerReading(transaction.transactionID, null, null, true);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.START, true, true);
    removeMoneyRequestOdometerImage(transaction, CONST.IOU.ODOMETER_IMAGE_TYPE.END, true, true);
    removeBackupTransaction(transaction.transactionID);
}

export {setMoneyRequestOdometerReading, setMoneyRequestOdometerImage, removeMoneyRequestOdometerImage};
export default clearOdometerDraftTransactionState;
