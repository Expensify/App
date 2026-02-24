/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReceiptScan from '@pages/iou/request/step/IOURequestStepScan/useReceiptScan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockHandleMoneyRequestStepScanParticipants = jest.fn();
const mockDismissProductTraining = jest.fn();
const mockRemoveDraftTransactions = jest.fn();
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

jest.mock('@libs/TransactionUtils', () => ({
    getDefaultTaxCode: () => '',
    hasReceipt: (transaction: unknown) => !!(transaction && typeof transaction === 'object' && 'receipt' in transaction && transaction.receipt),
    shouldReuseInitialTransaction: () => true,
}));

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    handleMoneyRequestStepScanParticipants: (...args: unknown[]) => mockHandleMoneyRequestStepScanParticipants(...args),
}));

jest.mock('@libs/actions/Welcome', () => ({
    dismissProductTraining: (...args: unknown[]) => mockDismissProductTraining(...args),
}));

jest.mock('@userActions/TransactionEdit', () => ({
    removeDraftTransactions: (...args: unknown[]) => mockRemoveDraftTransactions(...args),
    removeTransactionReceipt: (...args: unknown[]) => mockRemoveTransactionReceipt(...args),
    buildOptimisticTransactionAndCreateDraft: (...args: unknown[]) => mockBuildOptimisticTransactionAndCreateDraft(...args),
}));

jest.mock('@userActions/IOU', () => ({
    setMoneyRequestReceipt: (...args: unknown[]) => mockSetMoneyRequestReceipt(...args),
}));

jest.mock('@hooks/useOptimisticDraftTransactions', () => ({
    __esModule: true,
    default: () => [[], [{transactionID: '111'}, {transactionID: '222'}]],
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
        isMultiScanEnabled: false,
        isStartingScan: true,
        setIsMultiScanEnabled: undefined,
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

        it('should return canUseMultiScan true when isStartingScan and iouType is REQUEST', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(true);
        });

        it('should return canUseMultiScan false when iouType is SPLIT', async () => {
            const splitParams = {...params, iouType: CONST.IOU.TYPE.SPLIT};
            const {result} = renderHook(() => useReceiptScan(splitParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(false);
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

        it('should return canUseMultiScan false when isStartingScan is false', async () => {
            const paramsWithStartingScanDisabled = {...params, isStartingScan: false};
            const {result} = renderHook(() => useReceiptScan(paramsWithStartingScanDisabled));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(false);
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

        it('should clear receiptFiles when isMultiScanEnabled changes from true to false', async () => {
            const multiScanParams = {...params, isMultiScanEnabled: true, setIsMultiScanEnabled: jest.fn()};
            const {result, rerender} = renderHook((p: Parameters<typeof useReceiptScan>[0]) => useReceiptScan(p), {
                initialProps: multiScanParams,
            });
            await waitForBatchedUpdatesWithAct();

            const receiptFile = {file: {uri: 'picture.jpg'}, source: 'file://picture.jpg', transactionID: INITIAL_TRANSACTION_ID};
            await act(async () => {
                result.current.setReceiptFiles([receiptFile]);
            });
            await waitForBatchedUpdatesWithAct();
            expect(result.current.receiptFiles).toHaveLength(1);

            rerender({...multiScanParams, isMultiScanEnabled: false});
            await waitForBatchedUpdatesWithAct();
            expect(result.current.receiptFiles).toEqual([]);
        });
    });

    describe('multi-scan educational popup', () => {
        it('should initialize shouldShowMultiScanEducationalPopup as false', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(false);
        });

        it('should set shouldShowMultiScanEducationalPopup true when toggleMultiScan is called and modal was not dismissed', async () => {
            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.toggleMultiScan();
            });
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(true);
            expect(mockDismissProductTraining).not.toHaveBeenCalled();
        });

        it('should call setIsMultiScanEnabled and clear receipts when toggleMultiScan is called after modal dismissed', async () => {
            Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                [CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]: {timestamp: '2024-01-01', dismissedMethod: 'click'},
            });
            await waitForBatchedUpdatesWithAct();

            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.toggleMultiScan();
            });
            await waitForBatchedUpdatesWithAct();

            expect(setIsMultiScanEnabled).toHaveBeenCalledWith(true);
            expect(mockRemoveTransactionReceipt).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            expect(mockRemoveDraftTransactions).toHaveBeenCalledWith(true);
        });

        it('should set shouldShowMultiScanEducationalPopup false when dismissMultiScanEducationalPopup is called', async () => {
            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.toggleMultiScan();
            });
            await waitForBatchedUpdatesWithAct();
            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(true);

            await act(async () => {
                result.current.dismissMultiScanEducationalPopup();
            });
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(false);
            expect(mockDismissProductTraining).toHaveBeenCalledWith(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
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

        it('should call removeDraftTransactions when creating and not multi-scan', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{uri: 'file://receipt.jpg', name: 'receipt.jpg', type: 'image/jpeg'}];
            await act(async () => {
                result.current.validateFiles(files);
            });

            expect(mockRemoveDraftTransactions).toHaveBeenCalledWith(true);
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

        it('should call handleMoneyRequestStepScanParticipants when submitReceipts is called', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const files = [{file: {uri: 'image.jpg'}, source: 'file://image.jpg', transactionID: INITIAL_TRANSACTION_ID}];
            await act(async () => {
                result.current.submitReceipts(files);
            });

            expect(mockHandleMoneyRequestStepScanParticipants).toHaveBeenCalledWith(expect.objectContaining({files}));
        });

        it('should filter receiptFiles by optimistic transaction IDs when submitMultiScanReceipts is called', async () => {
            const {result} = renderHook(() => useReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            const validFile = {file: {uri: 'valid-receipt.jpg'}, source: 'file://valid-receipt.jpg', transactionID: '111'};
            const invalidFile = {file: {uri: 'invalid.jpg'}, source: 'file://invalid.jpg', transactionID: '999'};
            await act(async () => {
                result.current.setReceiptFiles([validFile, invalidFile]);
            });
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.submitMultiScanReceipts();
            });

            type HandleMoneyRequestStepScanPayload = {files: Array<{transactionID: string}>};
            const calls = mockHandleMoneyRequestStepScanParticipants.mock.calls as Array<[HandleMoneyRequestStepScanPayload]>;
            const scanParams = calls.at(0)?.at(0);
            expect(scanParams?.files).toHaveLength(1);
            expect(scanParams?.files.at(0)?.transactionID).toBe('111');
        });
    });
});
