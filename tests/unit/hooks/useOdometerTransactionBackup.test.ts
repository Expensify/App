import {renderHook} from '@testing-library/react-native';

import useOdometerTransactionBackup from '@pages/iou/request/step/IOURequestStepDistance/hooks/useOdometerTransactionBackup';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'odometer-backup-test';

const buildOdometerTransaction = (commentOverrides: Partial<OnyxTypes.Transaction['comment']> = {}): OnyxTypes.Transaction => {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: TRANSACTION_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        amount: 1234,
        merchant: '5 mi',
        comment: {
            ...transaction.comment,
            odometerStart: 100,
            odometerEnd: 250,
            ...commentOverrides,
        },
    };
};

type Params = Parameters<typeof useOdometerTransactionBackup>[0];

const renderBackupHook = (overrides: Partial<Params> = {}) => {
    const original = buildOdometerTransaction();
    const params: Params = {
        transaction: original,
        isEditingConfirmation: true,
        isTransactionDraft: false,
        transactionID: TRANSACTION_ID,
        didSaveEditingConfirmationRef: {current: false},
        backupHandledManuallyRef: {current: false},
        recoveryHandledBackupRef: {current: false},
        ...overrides,
    };
    return {original, ...renderHook(() => useOdometerTransactionBackup(params)), params};
};

describe('useOdometerTransactionBackup', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('edit-from-confirmation header-back restores once and does not null the transaction', async () => {
        const original = buildOdometerTransaction();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, original);
        await waitForBatchedUpdates();

        // Mount in edit-from-confirmation mode -> a backup of the original is created
        const {unmount} = renderBackupHook({transaction: original});
        await waitForBatchedUpdates();

        const backupAfterMount = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${TRANSACTION_ID}`);
        expect(backupAfterMount).toEqual(original);

        // Simulate the user editing the live transaction on the odometer screen
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, {...original, comment: {odometerStart: 100, odometerEnd: 999}, merchant: '899 mi', amount: 99999});
        await waitForBatchedUpdates();

        // Header back with no save -> the single cleanup restores from the backup
        unmount();
        await waitForBatchedUpdates();

        const restored = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
        const backupAfterUnmount = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${TRANSACTION_ID}`);

        // The transaction is restored exactly once: it equals the original and was NOT nulled
        // (a second restore would read the now-removed backup and wipe the transaction)
        expect(restored).toEqual(original);
        expect(restored).not.toBeNull();
        expect(restored).not.toBeUndefined();
        expect(backupAfterUnmount).toBeUndefined();
    });

    // The blob-failure recovery re-hydrates/clears the transaction and sets recoveryHandledBackupRef. The unmount
    // restore must then be skipped so it doesn't revert the recovery's work back to the pre-edit original.
    it('skips the unmount restore when the recovery already settled the transaction', async () => {
        const original = buildOdometerTransaction();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, original);
        await waitForBatchedUpdates();

        const recoveryHandledBackupRef = {current: false};
        const {unmount} = renderBackupHook({transaction: original, recoveryHandledBackupRef});
        await waitForBatchedUpdates();

        // The recovery re-hydrated the transaction to a new state and flagged that it handled the backup
        const recovered = {...original, comment: {odometerStart: 100, odometerEnd: 999}, merchant: '899 mi', amount: 99999};
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, recovered);
        await waitForBatchedUpdates();
        recoveryHandledBackupRef.current = true;

        unmount();
        await waitForBatchedUpdates();

        // The re-hydrated state survives - the restore did NOT run and revert it to the original
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`)).toEqual(recovered);
    });

    it('does not back up or restore when not editing from confirmation', async () => {
        const original = buildOdometerTransaction();
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, original);
        await waitForBatchedUpdates();

        const {unmount} = renderBackupHook({transaction: original, isEditingConfirmation: false});
        await waitForBatchedUpdates();

        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${TRANSACTION_ID}`)).toBeUndefined();

        unmount();
        await waitForBatchedUpdates();

        // The live transaction is untouched because no backup flow ran
        expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`)).toEqual(original);
    });
});
