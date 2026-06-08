import {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {openReport} from '@libs/actions/Report';
import {createBackupTransaction, removeBackupTransaction, restoreOriginalTransactionFromBackup} from '@libs/actions/TransactionEdit';
import {hasRoute} from '@libs/TransactionUtils';
import type {Beta, IntroSelected, Transaction} from '@src/types/onyx';

type UseDistanceTransactionBackupParams = {
    /** The transaction the editor is operating on. */
    transaction: OnyxEntry<Transaction>;

    /** True when the user is creating a brand-new expense (no backup needed). */
    isCreatingNewRequest: boolean;

    /** True when editing a split expense (those flows own their own backup state). */
    isEditingSplit: boolean;

    /** True when the transaction is held in the draft Onyx key rather than the real key. */
    isDraft: boolean;

    /** The current user's onboarding selection — used by the offline-recovery `openReport` call. */
    introSelected: OnyxEntry<IntroSelected>;

    /** The current user's enabled betas — used by the offline-recovery `openReport` call. */
    betas: OnyxEntry<Beta[]>;

    /** Caller-owned ref. Set `.current = true` once the user has confirmed a save so the cleanup drops the backup instead of restoring it. */
    transactionWasSavedRef: React.RefObject<boolean>;
};

function useDistanceTransactionBackup({transaction, isCreatingNewRequest, isEditingSplit, isDraft, introSelected, betas, transactionWasSavedRef}: UseDistanceTransactionBackupParams): void {
    // This effect runs when the component is mounted and unmounted. It's purpose is to be able to properly
    // discard changes if the user cancels out of making any changes. This is accomplished by backing up the
    // original transaction, letting the user modify the current transaction, and then if the user ever
    // cancels out of the modal without saving changes, the original transaction is restored from the backup.
    useEffect(() => {
        if (isCreatingNewRequest || isEditingSplit) {
            return () => {};
        }
        // On mount, create the backup transaction.
        createBackupTransaction(transaction, isDraft);

        return () => {
            // If the user cancels out of the modal without saving changes, then the original transaction
            // needs to be restored from the backup so that all changes are removed.
            // eslint-disable-next-line react-hooks/exhaustive-deps -- ref reads are stable; we intentionally read the latest `.current` at unmount
            if (transactionWasSavedRef.current) {
                removeBackupTransaction(transaction?.transactionID);
                return;
            }
            restoreOriginalTransactionFromBackup(transaction?.transactionID, isDraft);

            // If the user opens IOURequestStepDistance in offline mode and then goes online, re-open the report to fill in missing fields from the transaction backup
            if (!transaction?.reportID || hasRoute(transaction, true)) {
                return;
            }
            openReport({reportID: transaction?.reportID, introSelected, betas});
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount-only effect: backup on mount, restore-or-drop on unmount, never re-runs
    }, []);
}

export default useDistanceTransactionBackup;
