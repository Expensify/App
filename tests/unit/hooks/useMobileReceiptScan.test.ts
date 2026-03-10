/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useMobileReceiptScan from '@pages/iou/request/step/IOURequestStepScan/hooks/useMobileReceiptScan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockDismissProductTraining = jest.fn();
const mockRemoveDraftTransactions = jest.fn();
const mockRemoveTransactionReceipt = jest.fn();

jest.mock('@libs/actions/Welcome', () => ({
    dismissProductTraining: (...args: unknown[]) => mockDismissProductTraining(...args),
}));

jest.mock('@userActions/TransactionEdit', () => ({
    removeDraftTransactions: (...args: unknown[]) => mockRemoveDraftTransactions(...args),
    removeTransactionReceipt: (...args: unknown[]) => mockRemoveTransactionReceipt(...args),
}));

const INITIAL_TRANSACTION_ID = '987';
const REPORT_ID = '123';

function createDefaultParams(): Parameters<typeof useMobileReceiptScan>[0] {
    return {
        initialTransaction: {transactionID: INITIAL_TRANSACTION_ID, reportID: REPORT_ID, amount: 0} as Transaction,
        iouType: CONST.IOU.TYPE.REQUEST,
        isMultiScanEnabled: false,
        isStartingScan: true,
        receiptFiles: [],
        navigateToConfirmationStep: jest.fn(),
        shouldSkipConfirmation: false,
        setStartLocationPermissionFlow: jest.fn(),
        setIsMultiScanEnabled: jest.fn(),
    };
}

describe('useMobileReceiptScan', () => {
    let params: Parameters<typeof useMobileReceiptScan>[0];

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

    describe('canUseMultiScan', () => {
        it('should return true when isStartingScan and iouType is REQUEST', async () => {
            const {result} = renderHook(() => useMobileReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(true);
        });

        it('should return false when iouType is SPLIT', async () => {
            const splitParams = {...params, iouType: CONST.IOU.TYPE.SPLIT};
            const {result} = renderHook(() => useMobileReceiptScan(splitParams));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(false);
        });

        it('should return false when isStartingScan is false', async () => {
            const paramsWithStartingScanDisabled = {...params, isStartingScan: false};
            const {result} = renderHook(() => useMobileReceiptScan(paramsWithStartingScanDisabled));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(false);
        });
    });

    describe('multi-scan educational popup', () => {
        it('should initialize shouldShowMultiScanEducationalPopup as false', async () => {
            const {result} = renderHook(() => useMobileReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(false);
        });

        it('should set shouldShowMultiScanEducationalPopup true when toggleMultiScan is called and modal was not dismissed', async () => {
            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
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
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
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
            // Ensure modal was not previously dismissed so toggleMultiScan will show the popup
            Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {});
            await waitForBatchedUpdatesWithAct();

            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
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

    describe('submitReceipts and submitMultiScanReceipts', () => {
        it('should call navigateToConfirmationStep when submitReceipts is called', async () => {
            const navigateToConfirmationStep = jest.fn();
            const {result} = renderHook(() => useMobileReceiptScan({...params, navigateToConfirmationStep}));
            await waitForBatchedUpdatesWithAct();

            const files = [{file: {uri: 'image.jpg'}, source: 'file://image.jpg', transactionID: INITIAL_TRANSACTION_ID}];
            await act(async () => {
                result.current.submitReceipts(files);
            });

            expect(navigateToConfirmationStep).toHaveBeenCalledWith(files, false);
        });

        it('should filter receiptFiles by optimistic transaction IDs when submitMultiScanReceipts is called', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}111`, {transactionID: '111'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}222`, {transactionID: '222'});
            await waitForBatchedUpdatesWithAct();

            const navigateToConfirmationStep = jest.fn();
            const receiptFiles = [
                {file: {uri: 'valid-receipt.jpg'}, source: 'file://valid-receipt.jpg', transactionID: '111'},
                {file: {uri: 'invalid.jpg'}, source: 'file://invalid.jpg', transactionID: '999'},
            ];
            const {result} = renderHook(() => useMobileReceiptScan({...params, navigateToConfirmationStep, receiptFiles}));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.submitMultiScanReceipts();
            });

            expect(navigateToConfirmationStep).toHaveBeenCalledWith([expect.objectContaining({transactionID: '111'})], false);
        });
    });

    describe('blink and showBlink', () => {
        it('should return blinkStyle and showBlink', async () => {
            const {result} = renderHook(() => useMobileReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.blinkStyle).toBeDefined();
            expect(typeof result.current.showBlink).toBe('function');
        });
    });
});
