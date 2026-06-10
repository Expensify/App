import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {createBackupTransaction, removeBackupTransactionWithImageCleanup, restoreOriginalTransactionFromBackupWithImageCleanup} from '@libs/actions/TransactionEdit';
import type {Transaction} from '@src/types/onyx';

type UseOdometerTransactionBackupParams = {
    /** The transaction the editor is operating on. */
    transaction: OnyxEntry<Transaction>;

    /** True when navigating in from the confirmation screen to edit an existing odometer reading. */
    isEditingConfirmation: boolean;

    /** True when the transaction is held in the draft Onyx key rather than the real key. */
    isTransactionDraft: boolean;

    /** ID of the transaction being mutated. */
    transactionID: string;

    /** Caller-owned ref. Set `.current = true` once the user has confirmed an edit save so the cleanup drops the backup (with image cleanup) instead of restoring it. */
    didSaveEditingConfirmationRef: React.RefObject<boolean>;

    /** Caller-owned ref. Set `.current = true` to bypass cleanup entirely (used when the parent has already manually handled the backup, e.g. tab-switch flows). */
    backupHandledManuallyRef: React.RefObject<boolean>;
};

function useOdometerTransactionBackup({
    transaction,
    isEditingConfirmation,
    isTransactionDraft,
    transactionID,
    didSaveEditingConfirmationRef,
    backupHandledManuallyRef,
}: UseOdometerTransactionBackupParams): void {
    useEffect(() => {
        if (!isEditingConfirmation) {
            return () => {};
        }
        createBackupTransaction(transaction, isTransactionDraft, true);

        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps -- ref reads are stable; we intentionally read the latest `.current` at unmount to decide between bypass / drop / restore
            if (backupHandledManuallyRef.current) {
                return;
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps -- ref reads are stable; we intentionally read the latest `.current` at unmount
            if (didSaveEditingConfirmationRef.current) {
                removeBackupTransactionWithImageCleanup(transactionID, isTransactionDraft);
                return;
            }
            restoreOriginalTransactionFromBackupWithImageCleanup(transactionID, isTransactionDraft);
        };
        // We only want to create the backup once on mount and restore/remove it on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount-only effect, never re-runs
    }, []);
}

export default useOdometerTransactionBackup;
