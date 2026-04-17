/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReceiptScan from '@pages/iou/request/step/IOURequestStepScan/hooks/useReceiptScan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockHandleMoneyRequestStepScanParticipants = jest.fn();
const mockRemoveDraftTransactionsByIDs = jest.fn();
const mockGetMoneyRequestParticipantOptions = jest.fn().mockReturnValue([]);
const mockRemoveTransactionReceipt = jest.fn();
const mockSetMoneyRequestReceipt = jest.fn();
const mockBuildOptimisticTransactionAndCreateDraft = jest.fn();

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({
        policyForMovingExpenses: undefined,
    }),
}));

jest.mock('@hooks/useFilesValidation', () => ({
    __esModule: true,
    default: (callback: (files: unknown[]) => void) => ({
        validateFiles: callback,
        PDFValidationComponent: null,
        ErrorModal: null,
    }),
}));

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    handleMoneyRequestStepScanParticipants: (...args: unknown[]) => mockHandleMoneyRequestStepScanParticipants(...args),
    getMoneyRequestParticipantOptions: (...args: unknown[]) => mockGetMoneyRequestParticipantOptions(...args),
}));

jest.mock('@userActions/TransactionEdit', () => ({
    removeDraftTransactionsByIDs: (...args: unknown[]) => mockRemoveDraftTransactionsByIDs(...args),
    removeTransactionReceipt: (...args: unknown[]) => mockRemoveTransactionReceipt(...args),
    buildOptimisticTransactionAndCreateDraft: (...args: unknown[]) => mockBuildOptimisticTransactionAndCreateDraft(...args),
}));

jest.mock('@userActions/IOU/Receipt', () => ({
    setMoneyRequestReceipt: (...args: unknown[]) => mockSetMoneyRequestReceipt(...args),
}));

const REPORT_ID = '123';
const INITIAL_TRANSACTION_ID = '987';

function createDefaultParams(): Parameters<typeof useReceiptScan>[0] {
    return {
        report: {reportID: REPORT_ID, type: CONST.REPORT.TYPE.IOU} as Report,
        reportID: REPORT_ID,
        initialTransactionID: INITIAL_TRANSACTION_ID,
        initialTransaction: {transactionID: INITIAL_TRANSACTION_ID, reportID: REPORT_ID, amount: 0} as Transaction,
        iouType: CONST.IOU.TYPE.REQUEST,
        action: CONST.IOU.ACTION.CREATE,
        currentUserPersonalDetails: {accountID: 1, login: 'user@test.com'},
        updateScanAndNavigate: jest.fn(),
        getSource: (file: {uri?: string}) => file?.uri ?? 'file://image.png',
        backTo: undefined,
        backToReport: undefined,
        routeName: SCREENS.MONEY_REQUEST.CREATE,
    };
}

describe('useReceiptScan', () => {
    let params: Parameters<typeof useReceiptScan>[0];

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        params = createDefaultParams();
    });

    describe('shouldStartLocationPermissionFlow', () => {
        const now = new Date();
        const daysAgo = (days: number) => {
            const d = new Date(now);
            d.setDate(d.getDate() - days);
            return d.toISOString();
        };

        it('should return true when lastLocationPermissionPrompt is undefined', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(true);
        });

        it('should return true when lastLocationPermissionPrompt is null', async () => {
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, null);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(true);
        });

        it('should return true when lastLocationPermissionPrompt is empty string', async () => {
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, '');
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(true);
        });

        it('should return false when lastLocationPermissionPrompt is within threshold', async () => {
            const recentDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS - 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, recentDate);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(false);
        });

        it('should return true when lastLocationPermissionPrompt is outside threshold', async () => {
            const oldDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS + 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, oldDate);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(true);
        });

        it('should return false when lastLocationPermissionPrompt is invalid date string', async () => {
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, 'not-a-date');
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(false);
        });

        it('should return false when lastLocationPermissionPrompt is exactly at threshold', async () => {
            const thresholdDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, thresholdDate);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(false);
        });

        it('should react to changes in lastLocationPermissionPrompt', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(true);

            const recentDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS - 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, recentDate);
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(false);

            const oldDate = daysAgo(CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS + 1);
            Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, oldDate);
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldStartLocationPermissionFlow).toBe(true);
        });
    });

    describe('derived state values', () => {
        it('should return isEditing false when action is CREATE', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.isEditing).toBe(false);
        });

        it('should return isEditing true when action is EDIT', async () => {
            const editParams = {...params, action: CONST.IOU.ACTION.EDIT};
            const {result} = renderHook(() => useReceiptScan(editParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.isEditing).toBe(true);
        });

        it('should return shouldAcceptMultipleFiles true when not editing', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldAcceptMultipleFiles).toBe(true);
        });

        it('should return shouldAcceptMultipleFiles false when editing', async () => {
            const editParams = {...params, action: CONST.IOU.ACTION.EDIT};
            const {result} = renderHook(() => useReceiptScan(editParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldAcceptMultipleFiles).toBe(false);
        });

        it('should return shouldAcceptMultipleFiles false when backTo is set', async () => {
            const backToParams = {...params, backTo: 'home' as const};
            const {result} = renderHook(() => useReceiptScan(backToParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldAcceptMultipleFiles).toBe(false);
        });
    });

    describe('isReplacingReceipt', () => {
        it('should return true when action is EDIT and initialTransaction has receipt', async () => {
            const editWithReceiptParams: Parameters<typeof useReceiptScan>[0] = {
                ...params,
                action: CONST.IOU.ACTION.EDIT,
                initialTransaction: {...params.initialTransaction, receipt: {state: CONST.IOU.RECEIPT_STATE.OPEN}} as Transaction,
            };
            const {result} = renderHook(() => useReceiptScan(editWithReceiptParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.isReplacingReceipt).toBe(true);
        });

        it('should return false when action is EDIT and initialTransaction has no receipt', async () => {
            const editParams = {...params, action: CONST.IOU.ACTION.EDIT};
            const {result} = renderHook(() => useReceiptScan(editParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.isReplacingReceipt).toBe(false);
        });

        it('should return true when backTo is set and initialTransaction has receipt', async () => {
            const backToWithReceiptParams: Parameters<typeof useReceiptScan>[0] = {
                ...params,
                backTo: 'home' as const,
                initialTransaction: {...params.initialTransaction, receipt: {state: CONST.IOU.RECEIPT_STATE.OPEN}} as Transaction,
            };
            const {result} = renderHook(() => useReceiptScan(backToWithReceiptParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.isReplacingReceipt).toBe(true);
        });

        it('should return false when CREATE and no backTo and no receipt', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.isReplacingReceipt).toBe(false);
        });
    });

    describe('state management', () => {
        it('should update startLocationPermissionFlow state', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.startLocationPermissionFlow).toBe(false);

            await act(async () => {
                result.current.setStartLocationPermissionFlow(true);
            });
            await waitForBatchedUpdatesWithAct();

            expect(result.current.startLocationPermissionFlow).toBe(true);
        });

        it('should initialize receiptFiles as empty array', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.receiptFiles).toEqual([]);
        });

        it('should update receiptFiles state', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const receiptFile = {file: {uri: 'receipt.jpg'}, source: 'file://receipt.jpg', transactionID: INITIAL_TRANSACTION_ID};
            await act(async () => {
                result.current.setReceiptFiles([receiptFile]);
            });
            await waitForBatchedUpdatesWithAct();

            expect(result.current.receiptFiles).toHaveLength(1);
            expect(result.current.receiptFiles.at(0)).toEqual(receiptFile);
        });
    });

    describe('processReceipts', () => {
        it('should do nothing when files array is empty', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.validateFiles([]);
            });

            expect(mockSetMoneyRequestReceipt).not.toHaveBeenCalled();
            expect(mockHandleMoneyRequestStepScanParticipants).not.toHaveBeenCalled();
        });

        it('should call updateScanAndNavigate in editing mode', async () => {
            const updateScanAndNavigate = jest.fn();
            const editParams = {...params, action: CONST.IOU.ACTION.EDIT, updateScanAndNavigate};
            const {result} = renderHook(() => useReceiptScan(editParams));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockSetMoneyRequestReceipt).toHaveBeenCalledWith(INITIAL_TRANSACTION_ID, 'file://receipt.jpg', 'receipt.jpg', false, 'image/jpeg');
            expect(updateScanAndNavigate).toHaveBeenCalledWith(files.at(0), 'file://receipt.jpg');
            expect(mockHandleMoneyRequestStepScanParticipants).not.toHaveBeenCalled();
        });

        it('should call removeDraftTransactionsByIDs when creating and not multi-scan', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockRemoveDraftTransactionsByIDs).toHaveBeenCalledWith([], true);
        });

        it('should not call removeDraftTransactionsByIDs when in editing mode', async () => {
            const updateScanAndNavigate = jest.fn();
            const editParams = {...params, action: CONST.IOU.ACTION.EDIT, updateScanAndNavigate};
            const {result} = renderHook(() => useReceiptScan(editParams));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockRemoveDraftTransactionsByIDs).not.toHaveBeenCalled();
        });

        it('should pass draft transaction IDs to removeDraftTransactionsByIDs when drafts exist', async () => {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft1`]: {transactionID: 'draft1', reportID: REPORT_ID, amount: 100} as Transaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draft2`]: {transactionID: 'draft2', reportID: REPORT_ID, amount: 200} as Transaction,
            });
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockRemoveDraftTransactionsByIDs).toHaveBeenCalledWith(expect.arrayContaining(['draft1', 'draft2']), true);
        });

        it('should always pass shouldExcludeInitialTransaction as true to removeDraftTransactionsByIDs', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            const calls = mockRemoveDraftTransactionsByIDs.mock.calls as Array<[string[], boolean]>;
            expect(calls.length).toBeGreaterThan(0);
            for (const call of calls) {
                expect(call[1]).toBe(true);
            }
        });

        it('should not call removeDraftTransactionsByIDs when multi-scan is enabled', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.setIsMultiScanEnabled(true);
            });
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockRemoveDraftTransactionsByIDs).not.toHaveBeenCalled();
        });

        it('should not call removeDraftTransactionsByIDs when isStartingScan is false', async () => {
            const nonStartingParams = {...params, routeName: SCREENS.MONEY_REQUEST.STEP_SCAN};
            const {result} = renderHook(() => useReceiptScan(nonStartingParams));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockRemoveDraftTransactionsByIDs).not.toHaveBeenCalled();
        });

        it('should call removeDraftTransactionsByIDs with multiple draft IDs and shouldExcludeInitialTransaction true', async () => {
            await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draftX`]: {transactionID: 'draftX', reportID: REPORT_ID, amount: 10} as Transaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draftY`]: {transactionID: 'draftY', reportID: REPORT_ID, amount: 20} as Transaction,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}draftZ`]: {transactionID: 'draftZ', reportID: REPORT_ID, amount: 30} as Transaction,
            });
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockRemoveDraftTransactionsByIDs).toHaveBeenCalledWith(expect.arrayContaining(['draftX', 'draftY', 'draftZ']), true);
        });

        it('should navigate to confirmation step after processing files', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockHandleMoneyRequestStepScanParticipants).toHaveBeenCalledWith(
                expect.objectContaining({
                    files: expect.arrayContaining([expect.objectContaining({source: 'file://receipt.jpg'})]),
                }),
            );
        });
    });

    describe('navigateToConfirmationStep and submitReceipts', () => {
        it('should call handleMoneyRequestStepScanParticipants when navigateToConfirmationStep is called', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{file: {uri: 'receipt.jpg'}, source: 'file://receipt.jpg', transactionID: INITIAL_TRANSACTION_ID}];
            await act(async () => {
                result.current.navigateToConfirmationStep(files, false, false);
            });

            expect(mockHandleMoneyRequestStepScanParticipants).toHaveBeenCalledWith(
                expect.objectContaining({
                    files,
                    isTestTransaction: false,
                    locationPermissionGranted: false,
                }),
            );
        });
    });
});
