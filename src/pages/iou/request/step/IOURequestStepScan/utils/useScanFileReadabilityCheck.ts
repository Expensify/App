import {isLocalFile} from '@libs/fileDownload/FileUtils';

import {checkIfLocalFileIsAccessible} from '@userActions/IOU/Receipt';
import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

import {useEffect, useRef} from 'react';

/**
 * On mount, verifies that all local receipt files (blob:// URLs) are still readable.
 * If the browser was refreshed, blob URLs cease to exist — this resets the scan flow
 * so the user can start over rather than seeing broken images.
 */
function useScanFileReadabilityCheck(transactions: Array<Partial<Transaction>>, draftTransactionIDs: string[], disableMultiScan: () => void) {
    const hasValidated = useRef(false);

    useEffect(() => {
        if (hasValidated.current) {
            return;
        }
        hasValidated.current = true;

        let isAllScanFilesCanBeRead = true;

        Promise.all(
            transactions.map((item) => {
                const itemReceiptPath = item.receipt?.source;
                const isLocal = isLocalFile(itemReceiptPath);

                if (!isLocal) {
                    return Promise.resolve();
                }

                const onFailure = () => {
                    isAllScanFilesCanBeRead = false;
                };

                return checkIfLocalFileIsAccessible(item.receipt?.filename, itemReceiptPath, item.receipt?.type, () => {}, onFailure);
            }),
        ).then(() => {
            if (isAllScanFilesCanBeRead) {
                return;
            }
            disableMultiScan();
            removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            removeDraftTransactionsByIDs(draftTransactionIDs, true);
        });
    }, [disableMultiScan, transactions, draftTransactionIDs]);
}

export default useScanFileReadabilityCheck;
