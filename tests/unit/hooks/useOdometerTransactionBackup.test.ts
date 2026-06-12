import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useOdometerTransactionBackup from '@pages/iou/request/step/IOURequestStepDistance/hooks/useOdometerTransactionBackup';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'odometer-backup-test';

const buildOdometerTransaction = (overrides: Partial<OnyxTypes.Transaction['comment']> = {}): OnyxTypes.Transaction =>
    ({
        transactionID: TRANSACTION_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        amount: 1234,
        merchant: '5 mi',
        comment: {
            odometerStart: 100,
            odometerEnd: 250,
            ...overrides,
        },
    }) as unknown as OnyxTypes.Transaction;

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
