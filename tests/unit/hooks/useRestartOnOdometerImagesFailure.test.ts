import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type useRestartOnOdometerImagesFailureType from '@hooks/useRestartOnOdometerImagesFailure';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// The hook has a native variant that hardcodes hasVerifiedBlobs:true (no verification). Jest's default platform is
// native, so force the WEB implementation (index.ts) - that's the only platform where the blob-verification path exists.
const useRestartOnOdometerImagesFailure = jest.requireActual<{default: typeof useRestartOnOdometerImagesFailureType}>('@hooks/useRestartOnOdometerImagesFailure/index.ts').default;

// Drive blob-accessibility verification deterministically: a "dead" blob (post-reload) takes the failure path.
const mockCheckIfLocalFileIsAccessible = jest.fn<void, [string | undefined, string | undefined, string | undefined, () => void, () => void]>();
jest.mock('@libs/actions/IOU/Receipt', () => ({
    checkIfLocalFileIsAccessible: (filename: string | undefined, path: string | undefined, type: string | undefined, onSuccess: () => void, onFailure: () => void) =>
        mockCheckIfLocalFileIsAccessible(filename, path, type, onSuccess, onFailure),
}));

// Spy the failure-branch side effects (rehydrate / clear) and break the heavy transitive import chain.
const mockHydrate = jest.fn<void, unknown[]>();
const mockClear = jest.fn<void, unknown[]>();
jest.mock('@libs/actions/OdometerTransactionUtils', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockClear(...args),
    hydrateOdometerDraftIntoTransaction: (...args: unknown[]) => {
        mockHydrate(...args);
        return Promise.resolve();
    },
}));

const mockNavigateToStartMoneyRequestStep = jest.fn<void, unknown[]>();
jest.mock('@libs/IOUUtils', () => ({
    navigateToStartMoneyRequestStep: (...args: unknown[]) => mockNavigateToStartMoneyRequestStep(...args),
}));

// Keep getOdometerImageUri real (mirrors the real impl) but break the FileUtils -> API transitive chain.
jest.mock('@libs/OdometerUtils', () => ({
    __esModule: true,
    default: jest.fn(),
    getOdometerImageUri: (image: {uri?: string} | string | null | undefined) => (typeof image === 'string' ? image : (image?.uri ?? '')),
}));

const REPORT_ID = 'report1';
const TRANSACTION_ID = 'txn1';

function buildTransactionWithDeadBlob(): Transaction {
    const transaction = createRandomTransaction(1);
    return {
        ...transaction,
        transactionID: TRANSACTION_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER,
        comment: {
            ...transaction.comment,
            odometerStart: 100,
            odometerEnd: 300,
            // A blob: URL is what a reloaded session leaves behind; checkIfLocalFileIsAccessible will fail on it.
            odometerStartImage: {uri: 'blob:http://localhost/dead', name: 'start.png', type: 'image/png', size: 10},
        },
    };
}

describe('useRestartOnOdometerImagesFailure', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        // A dead blob fails accessibility verification (the post-reload state).
        mockCheckIfLocalFileIsAccessible.mockImplementation((filename, path, type, onSuccess, onFailure) => onFailure());
        await waitForBatchedUpdates();
    });

    // When a save-for-later draft exists the recovery re-mints from base64, marks verification passed (so the
    // baseline snapshot can initialize), and signals backup-handled with shouldResetLocalState:false. The caller
    // routes that signal to a recovery-only ref (not backupHandledManually), so the discard guard stays active.
    it('rehydrates, marks verified, and signals backup-handled (no local reset) when a draft exists', async () => {
        const transaction = buildTransactionWithDeadBlob();
        const onBackupHandled = jest.fn<void, [{shouldResetLocalState: boolean}]>();
        await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, {odometerStartReading: 100, odometerEndReading: 300, odometerStartImage: 'data:image/png;base64,xxx'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useRestartOnOdometerImagesFailure(transaction, REPORT_ID, CONST.IOU.TYPE.SUBMIT, undefined, onBackupHandled));
        await waitForBatchedUpdates();

        expect(result.current.hasVerifiedBlobs).toBe(true);
        expect(mockHydrate).toHaveBeenCalled();
        expect(onBackupHandled).toHaveBeenCalledWith({shouldResetLocalState: false});
        expect(mockClear).not.toHaveBeenCalled();
        expect(mockNavigateToStartMoneyRequestStep).toHaveBeenCalled();
    });

    // No draft = truly unrecoverable images: the backup-handled signal + clear + restart are still required.
    it('clears and signals backup-handled when no draft exists', async () => {
        const transaction = buildTransactionWithDeadBlob();
        const onBackupHandled = jest.fn<void, [{shouldResetLocalState: boolean}]>();
        await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, null);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
        await waitForBatchedUpdates();

        renderHook(() => useRestartOnOdometerImagesFailure(transaction, REPORT_ID, CONST.IOU.TYPE.SUBMIT, undefined, onBackupHandled));
        await waitForBatchedUpdates();

        expect(onBackupHandled).toHaveBeenCalledWith({shouldResetLocalState: true});
        expect(mockClear).toHaveBeenCalled();
        expect(mockHydrate).not.toHaveBeenCalled();
        expect(mockNavigateToStartMoneyRequestStep).toHaveBeenCalled();
    });

    // Sanity: with no blob URLs to verify there's nothing to recover - verification passes immediately.
    it('reports verified when the transaction has no blob URLs', async () => {
        const transaction = createRandomTransaction(1);
        transaction.transactionID = TRANSACTION_ID;
        transaction.comment = {odometerStart: 100, odometerEnd: 300};
        await Onyx.set(ONYXKEYS.ODOMETER_DRAFT, null);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useRestartOnOdometerImagesFailure(transaction, REPORT_ID, CONST.IOU.TYPE.SUBMIT, undefined, jest.fn()));
        await waitForBatchedUpdates();

        expect(result.current.hasVerifiedBlobs).toBe(true);
        expect(mockNavigateToStartMoneyRequestStep).not.toHaveBeenCalled();
    });
});
