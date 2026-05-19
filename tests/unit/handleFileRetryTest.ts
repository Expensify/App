import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import handleFileRetry from '@libs/ReceiptUploadRetryHandler/handleFileRetry';
import type {RequestMoneyInformation} from '@userActions/IOU/MoneyRequestBuilder';
import {replaceReceipt} from '@userActions/IOU/Receipt';
import type {ReplaceReceipt} from '@userActions/IOU/Receipt';
import {startSplitBill} from '@userActions/IOU/Split';
import type {StartSplitBilActionParams} from '@userActions/IOU/Split';
import {requestMoney, trackExpense} from '@userActions/IOU/TrackExpense';
import type {CreateTrackExpenseParams} from '@userActions/IOU/TrackExpense';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';

jest.mock('@libs/Navigation/helpers/cleanupAfterExpenseCreate', () => jest.fn());
jest.mock('@userActions/IOU/TrackExpense', () => ({
    trackExpense: jest.fn(),
    requestMoney: jest.fn(),
}));
jest.mock('@userActions/IOU/Receipt', () => ({
    replaceReceipt: jest.fn(),
}));
jest.mock('@userActions/IOU/Split', () => ({
    startSplitBill: jest.fn(),
}));

const dismissError = jest.fn();
const setShouldShowErrorModal = jest.fn();
const file = new File([], 'receipt.jpg');

function makeTrackExpenseRetry(overrides?: Partial<CreateTrackExpenseParams>): ReceiptError {
    const retryParams: Partial<CreateTrackExpenseParams> = {
        transactionParams: {amount: 500, currency: 'USD', created: '2026-04-20'},
        draftTransactionIDs: ['txn-track-1', 'txn-track-2'],
        ...overrides,
    };
    return {
        action: CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE,
        retryParams: retryParams as CreateTrackExpenseParams,
    } as ReceiptError;
}

function makeMoneyRequestRetry(overrides?: Partial<RequestMoneyInformation>): ReceiptError {
    const retryParams: Partial<RequestMoneyInformation> = {
        transactionParams: {amount: 500, currency: 'USD', created: '2026-04-20', merchant: 'Starbucks'},
        draftTransactionIDs: ['txn-money-1', 'txn-money-2'],
        ...overrides,
    };
    return {
        action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST,
        retryParams: retryParams as RequestMoneyInformation,
    } as ReceiptError;
}

describe('handleFileRetry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('TRACK_EXPENSE retry', () => {
        it('should call trackExpense with isRetry=true, then cleanupAfterExpenseCreate with the retry-payload draft list', () => {
            const callOrder: string[] = [];
            (trackExpense as jest.Mock).mockImplementation(() => callOrder.push('trackExpense'));
            (cleanupAfterExpenseCreate as jest.Mock).mockImplementation(() => callOrder.push('cleanup'));

            handleFileRetry(makeTrackExpenseRetry(), file, dismissError, setShouldShowErrorModal);

            expect(dismissError).toHaveBeenCalledTimes(1);
            expect(trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    isRetry: true,
                    shouldPlaySound: false,
                    transactionParams: expect.objectContaining({receipt: file}),
                }),
            );
            // Cleanup MUST fire after the action, never before
            expect(callOrder).toEqual(['trackExpense', 'cleanup']);
            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
                draftTransactionIDs: ['txn-track-1', 'txn-track-2'],
            });
        });

        it('should forward linkedTrackedExpenseReportAction through cleanup for TRACK_EXPENSE retries (CATEGORIZE/SHARE flow)', () => {
            const linkedTrackedExpenseReportAction = {childReportID: 'child-1'} as ReportAction;

            handleFileRetry(
                makeTrackExpenseRetry({
                    transactionParams: {amount: 500, currency: 'USD', created: '2026-04-20', linkedTrackedExpenseReportAction},
                }),
                file,
                dismissError,
                setShouldShowErrorModal,
            );

            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({linkedTrackedExpenseReportAction}));
        });

        it('should pass undefined draftTransactionIDs when the retry payload omits them', () => {
            handleFileRetry(makeTrackExpenseRetry({draftTransactionIDs: undefined}), file, dismissError, setShouldShowErrorModal);

            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftTransactionIDs: undefined,
                }),
            );
        });
    });

    describe('MONEY_REQUEST retry', () => {
        it('should call requestMoney with isRetry=true, then cleanupAfterExpenseCreate with the retry-payload draft list', () => {
            const callOrder: string[] = [];
            (requestMoney as jest.Mock).mockImplementation(() => callOrder.push('requestMoney'));
            (cleanupAfterExpenseCreate as jest.Mock).mockImplementation(() => callOrder.push('cleanup'));

            handleFileRetry(makeMoneyRequestRetry(), file, dismissError, setShouldShowErrorModal);

            expect(dismissError).toHaveBeenCalledTimes(1);
            expect(requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    isRetry: true,
                    shouldPlaySound: false,
                    transactionParams: expect.objectContaining({receipt: file}),
                }),
            );
            expect(callOrder).toEqual(['requestMoney', 'cleanup']);
            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
                draftTransactionIDs: ['txn-money-1', 'txn-money-2'],
                linkedTrackedExpenseReportAction: undefined,
            });
        });

        it('should forward linkedTrackedExpenseReportAction through cleanup for MONEY_REQUEST retries (move-from-track flow)', () => {
            const linkedTrackedExpenseReportAction = {childReportID: 'child-1'} as ReportAction;

            handleFileRetry(
                makeMoneyRequestRetry({
                    transactionParams: {amount: 500, currency: 'USD', created: '2026-04-20', merchant: 'Starbucks', linkedTrackedExpenseReportAction},
                }),
                file,
                dismissError,
                setShouldShowErrorModal,
            );

            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({linkedTrackedExpenseReportAction}));
        });
    });

    describe('non-expense-creation branches', () => {
        it('should NOT call cleanupAfterExpenseCreate for REPLACE_RECEIPT', () => {
            const message = {action: CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT, retryParams: {} as unknown as ReplaceReceipt} as ReceiptError;

            handleFileRetry(message, file, dismissError, setShouldShowErrorModal);

            expect(replaceReceipt).toHaveBeenCalledTimes(1);
            expect(cleanupAfterExpenseCreate).not.toHaveBeenCalled();
        });

        it('should NOT call cleanupAfterExpenseCreate for START_SPLIT_BILL', () => {
            const message = {action: CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL, retryParams: {} as unknown as StartSplitBilActionParams} as ReceiptError;

            handleFileRetry(message, file, dismissError, setShouldShowErrorModal);

            expect(startSplitBill).toHaveBeenCalledTimes(1);
            expect(cleanupAfterExpenseCreate).not.toHaveBeenCalled();
        });
    });
});
