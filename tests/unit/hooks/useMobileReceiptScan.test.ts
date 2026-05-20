import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useMobileReceiptScan from '@pages/iou/request/step/IOURequestStepScan/hooks/useMobileReceiptScan';
import type {UseMobileReceiptScanParams} from '@pages/iou/request/step/IOURequestStepScan/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockDismissProductTraining = jest.fn();
const mockRemoveDraftTransactions = jest.fn();
const mockRemoveTransactionReceipt = jest.fn();

jest.mock('@libs/actions/Welcome', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    dismissProductTraining: (...args: unknown[]) => mockDismissProductTraining(...args),
}));

jest.mock('@userActions/TransactionEdit', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    removeDraftTransactionsByIDs: (...args: unknown[]) => mockRemoveDraftTransactions(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    removeTransactionReceipt: (...args: unknown[]) => mockRemoveTransactionReceipt(...args),
}));

const INITIAL_TRANSACTION_ID = '987';
const REPORT_ID = '123';

function createDefaultParams(): UseMobileReceiptScanParams {
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
        setReceiptFiles: jest.fn(),
    };
}

describe('useMobileReceiptScan', () => {
    let params: UseMobileReceiptScanParams;

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
        it('should return true when isStartingScan is true and iouType is REQUEST', async () => {
            // Given the hook is rendered with isStartingScan set to true and iouType set to REQUEST
            const {result} = renderHook(() => useMobileReceiptScan(params));
            await waitForBatchedUpdatesWithAct();

            // Then canUseMultiScan should be true
            expect(result.current.canUseMultiScan).toBe(true);
        });

        it('should return false when iouType is SPLIT', async () => {
            // Given the hook is rendered with iouType set to SPLIT
            const splitParams = {...params, iouType: CONST.IOU.TYPE.SPLIT};
            const {result} = renderHook(() => useMobileReceiptScan(splitParams));
            await waitForBatchedUpdatesWithAct();

            // Then canUseMultiScan should be false
            expect(result.current.canUseMultiScan).toBe(false);
        });

        it('should return false when isStartingScan is false', async () => {
            // Given the hook is rendered with isStartingScan set to false
            const paramsWithStartingScanDisabled = {...params, isStartingScan: false};
            const {result} = renderHook(() => useMobileReceiptScan(paramsWithStartingScanDisabled));
            await waitForBatchedUpdatesWithAct();

            // Then canUseMultiScan should be false
            expect(result.current.canUseMultiScan).toBe(false);
        });
    });

    describe('toggleMultiScan', () => {
        it('should set shouldShowMultiScanEducationalPopup to true when the modal has not been dismissed', async () => {
            // Given the hook is rendered and the multi-scan educational modal has not been previously dismissed
            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            // When toggleMultiScan is called
            await act(async () => {
                result.current.toggleMultiScan();
            });

            // Then shouldShowMultiScanEducationalPopup should be true
            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(true);
            expect(setIsMultiScanEnabled).toHaveBeenCalledWith(true);
            expect(mockRemoveTransactionReceipt).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            expect(mockRemoveDraftTransactions).toHaveBeenCalledWith(expect.anything(), true);
        });

        it('should not set shouldShowMultiScanEducationalPopup to true after the modal is dismissed', async () => {
            // Given the multi-scan educational modal has been previously dismissed
            Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                [CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]: {timestamp: '2024-01-01', dismissedMethod: 'click'},
            });
            await waitForBatchedUpdatesWithAct();

            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            // When toggleMultiScan is called
            await act(async () => {
                result.current.toggleMultiScan();
            });

            // Then shouldShowMultiScanEducationalPopup should be false
            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(false);
            expect(setIsMultiScanEnabled).toHaveBeenCalledWith(true);
            expect(mockRemoveTransactionReceipt).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            expect(mockRemoveDraftTransactions).toHaveBeenCalledWith(expect.anything(), true);
        });

        it('should clear receiptFiles when disabling multi-scan', async () => {
            const setReceiptFiles = jest.fn();
            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, setReceiptFiles, isMultiScanEnabled: true};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.toggleMultiScan();
            });

            expect(setReceiptFiles).toHaveBeenCalledWith([]);
            expect(setIsMultiScanEnabled).toHaveBeenCalledWith(false);
        });

        it('should not clear receiptFiles when enabling multi-scan', async () => {
            const setReceiptFiles = jest.fn();
            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, setReceiptFiles, isMultiScanEnabled: false};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.toggleMultiScan();
            });

            expect(setReceiptFiles).not.toHaveBeenCalled();
            expect(setIsMultiScanEnabled).toHaveBeenCalledWith(true);
        });
    });

    describe('dismissMultiScanEducationalPopup', () => {
        it('should set shouldShowMultiScanEducationalPopup to false', async () => {
            // Given the multi-scan educational modal is currently shown
            Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {});
            await waitForBatchedUpdatesWithAct();

            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.toggleMultiScan();
            });
            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(true);

            // When dismissMultiScanEducationalPopup is called
            await act(async () => {
                result.current.dismissMultiScanEducationalPopup();
            });

            // Then shouldShowMultiScanEducationalPopup should be false
            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(false);
            expect(mockDismissProductTraining).toHaveBeenCalledWith(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
        });
    });

    describe('submitReceipts', () => {
        it('should call navigateToConfirmationStep', async () => {
            // Given the hook is rendered with navigateToConfirmationStep mock
            const navigateToConfirmationStep = jest.fn();
            const {result} = renderHook(() => useMobileReceiptScan({...params, navigateToConfirmationStep}));
            await waitForBatchedUpdatesWithAct();

            const files = [{file: {uri: 'image.jpg'}, source: 'file://image.jpg', transactionID: INITIAL_TRANSACTION_ID}];

            // When submitReceipts is called with files
            await act(async () => {
                result.current.submitReceipts(files);
            });

            // Then navigateToConfirmationStep should be called with the files
            expect(navigateToConfirmationStep).toHaveBeenCalledWith(files, false);
        });

        it('should start the location permission flow when shouldSkipConfirmation is true and the location permission is required', async () => {
            // Given shouldSkipConfirmation is true and the location permission is required
            const navigateToConfirmationStep = jest.fn();
            const setStartLocationPermissionFlow = jest.fn();
            const {result} = renderHook(() => useMobileReceiptScan({...params, shouldSkipConfirmation: true, navigateToConfirmationStep, setStartLocationPermissionFlow}));
            await waitForBatchedUpdatesWithAct();

            const files = [{file: {uri: 'image.jpg'}, source: 'file://image.jpg', transactionID: INITIAL_TRANSACTION_ID}];

            // When submitReceipts is called
            await act(async () => {
                result.current.submitReceipts(files);
            });

            // Then setStartLocationPermissionFlow should be called with true
            expect(setStartLocationPermissionFlow).toHaveBeenCalledWith(true);

            // And navigateToConfirmationStep should not be called
            expect(navigateToConfirmationStep).not.toHaveBeenCalled();
        });
    });

    describe('submitMultiScanReceipts', () => {
        it('should filter receiptFiles by optimistic transaction IDs', async () => {
            // Given there are valid and invalid draft transaction IDs in Onyx
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

            // When submitMultiScanReceipts is called
            await act(async () => {
                result.current.submitMultiScanReceipts();
            });

            // Then navigateToConfirmationStep should be called with only the valid receipt file
            expect(navigateToConfirmationStep).toHaveBeenCalledWith([receiptFiles.at(0)], false);
        });
    });
});
