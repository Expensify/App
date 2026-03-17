import {useEffect} from 'react';
import {isLocalFile as isLocalFileFileUtils} from '@libs/fileDownload/FileUtils';
import {checkIfScanFileCanBeRead} from '@userActions/IOU';
import {removeDraftTransactions, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

/**
 * Checks whether all scan files in the given transactions can be read on mount.
 * If any local file is unreadable, removes the transaction receipt and draft transactions.
 */
function useScanFileReadabilityCheck(transactions: Transaction[]) {
    useEffect(() => {
        let isAllScanFilesCanBeRead = true;

        Promise.all(
            transactions.map((item) => {
                const itemReceiptPath = item.receipt?.source;
                const isLocalFile = isLocalFileFileUtils(itemReceiptPath);

                if (!isLocalFile) {
                    return Promise.resolve();
                }

                const onFailure = () => {
                    isAllScanFilesCanBeRead = false;
                };

                return checkIfScanFileCanBeRead(item.receipt?.filename, itemReceiptPath, item.receipt?.type, () => {}, onFailure);
            }),
        ).then(() => {
            if (isAllScanFilesCanBeRead) {
                return;
            }
            removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            removeDraftTransactions(true);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

export default useScanFileReadabilityCheck;
