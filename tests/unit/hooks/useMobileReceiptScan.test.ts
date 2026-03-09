/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import useMobileReceiptScan from '@pages/iou/request/step/IOURequestStepScan/hooks/useMobileReceiptScan';
import type useReceiptScan from '@pages/iou/request/step/IOURequestStepScan/hooks/useReceiptScan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
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

const REPORT_ID = '123';
const INITIAL_TRANSACTION_ID = '987';

function createMockReceiptScan(overrides: Partial<ReturnType<typeof useReceiptScan>> = {}): ReturnType<typeof useReceiptScan> {
    return {
        transactions: [],
        optimisticTransactions: [{transactionID: '111'}, {transactionID: '222'}] as ReturnType<typeof useReceiptScan>['optimisticTransactions'],
        isEditing: false,
        isReplacingReceipt: false,
        shouldAcceptMultipleFiles: true,
        shouldSkipConfirmation: false,
        startLocationPermissionFlow: false,
        setStartLocationPermissionFlow: jest.fn(),
        shouldStartLocationPermissionFlow: false,
        receiptFiles: [],
        setReceiptFiles: jest.fn(),
        navigateToConfirmationStep: jest.fn(),
        validateFiles: jest.fn(),
        PDFValidationComponent: [],
        ErrorModal: React.createElement(React.Fragment),
        setTestReceiptAndNavigate: jest.fn(),
        ...overrides,
    };
}

function createDefaultParams(): Parameters<typeof useMobileReceiptScan>[0] {
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
        setIsMultiScanEnabled: jest.fn(),
    };
}

describe('useMobileReceiptScan', () => {
    let params: Parameters<typeof useMobileReceiptScan>[0];
    let mockReceiptScan: ReturnType<typeof useReceiptScan>;

    beforeAll(() => {
        Onyx.init({
            keys: {
                [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {},
            },
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        params = createDefaultParams();
        mockReceiptScan = createMockReceiptScan();
    });

    describe('canUseMultiScan', () => {
        it('should return true when isStartingScan and iouType is REQUEST', async () => {
            const {result} = renderHook(() => useMobileReceiptScan(params, mockReceiptScan));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(true);
        });

        it('should return false when iouType is SPLIT', async () => {
            const splitParams = {...params, iouType: CONST.IOU.TYPE.SPLIT};
            const {result} = renderHook(() => useMobileReceiptScan(splitParams, mockReceiptScan));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(false);
        });

        it('should return false when isStartingScan is false', async () => {
            const paramsWithStartingScanDisabled = {...params, isStartingScan: false};
            const {result} = renderHook(() => useMobileReceiptScan(paramsWithStartingScanDisabled, mockReceiptScan));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.canUseMultiScan).toBe(false);
        });
    });

    describe('multi-scan educational popup', () => {
        it('should initialize shouldShowMultiScanEducationalPopup as false', async () => {
            const {result} = renderHook(() => useMobileReceiptScan(params, mockReceiptScan));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.shouldShowMultiScanEducationalPopup).toBe(false);
        });

        it('should set shouldShowMultiScanEducationalPopup true when toggleMultiScan is called and modal was not dismissed', async () => {
            const setIsMultiScanEnabled = jest.fn();
            const toggleParams = {...params, setIsMultiScanEnabled, isMultiScanEnabled: false};
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams, mockReceiptScan));
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
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams, mockReceiptScan));
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
            const {result} = renderHook(() => useMobileReceiptScan(toggleParams, mockReceiptScan));
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
            const receiptScanWithNavigate = createMockReceiptScan({navigateToConfirmationStep});
            const {result} = renderHook(() => useMobileReceiptScan(params, receiptScanWithNavigate));
            await waitForBatchedUpdatesWithAct();

            const files = [{file: {uri: 'image.jpg'}, source: 'file://image.jpg', transactionID: INITIAL_TRANSACTION_ID}];
            await act(async () => {
                result.current.submitReceipts(files);
            });

            expect(navigateToConfirmationStep).toHaveBeenCalledWith(files, false);
        });

        it('should filter receiptFiles by optimistic transaction IDs when submitMultiScanReceipts is called', async () => {
            const navigateToConfirmationStep = jest.fn();
            const setReceiptFiles = jest.fn();
            const receiptScanWithNavigate = createMockReceiptScan({
                navigateToConfirmationStep,
                setReceiptFiles,
                receiptFiles: [
                    {file: {uri: 'valid-receipt.jpg'}, source: 'file://valid-receipt.jpg', transactionID: '111'},
                    {file: {uri: 'invalid.jpg'}, source: 'file://invalid.jpg', transactionID: '999'},
                ],
            });
            const {result} = renderHook(() => useMobileReceiptScan(params, receiptScanWithNavigate));
            await waitForBatchedUpdatesWithAct();

            await act(async () => {
                result.current.submitMultiScanReceipts();
            });

            expect(navigateToConfirmationStep).toHaveBeenCalledWith([expect.objectContaining({transactionID: '111'})], false);
        });
    });

    describe('blink and showBlink', () => {
        it('should return blinkStyle and showBlink', async () => {
            const {result} = renderHook(() => useMobileReceiptScan(params, mockReceiptScan));
            await waitForBatchedUpdatesWithAct();

            expect(result.current.blinkStyle).toBeDefined();
            expect(typeof result.current.showBlink).toBe('function');
        });
    });
});
