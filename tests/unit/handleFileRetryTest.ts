import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import handleFileRetry from '@libs/ReceiptUploadRetryHandler/handleFileRetry';
import type * as IOU from '@userActions/IOU';
import {replaceReceipt} from '@userActions/IOU/Receipt';
import {startSplitBill} from '@userActions/IOU/Split';
import * as TrackExpense from '@userActions/IOU/TrackExpense';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
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

function makeTrackExpenseRetry(overrides?: Partial<TrackExpense.CreateTrackExpenseParams>): ReceiptError {
    const retryParams: Partial<TrackExpense.CreateTrackExpenseParams> = {
        transactionParams: {amount: 500, currency: 'USD', created: '2026-04-20'},
        existingTransaction: {transactionID: 'txn-track-1'} as Transaction,
        ...overrides,
    };
    return {
        action: CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE,
        retryParams: retryParams as TrackExpense.CreateTrackExpenseParams,
    } as ReceiptError;
}

function makeMoneyRequestRetry(overrides?: Partial<IOU.RequestMoneyInformation>): ReceiptError {
    const retryParams: Partial<IOU.RequestMoneyInformation> = {
        transactionParams: {amount: 500, currency: 'USD', created: '2026-04-20', merchant: 'Starbucks'},
        existingTransactionDraft: {transactionID: 'txn-money-1'} as Transaction,
        ...overrides,
    };
    return {
        action: CONST.IOU.ACTION_PARAMS.MONEY_REQUEST,
        retryParams: retryParams as IOU.RequestMoneyInformation,
    } as ReceiptError;
}

describe('handleFileRetry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('TRACK_EXPENSE retry', () => {
        it('calls trackExpense with isRetry=true, then cleanupAfterExpenseCreate with the existing transactionID', () => {
            const callOrder: string[] = [];
            (TrackExpense.trackExpense as jest.Mock).mockImplementation(() => callOrder.push('trackExpense'));
            (cleanupAfterExpenseCreate as jest.Mock).mockImplementation(() => callOrder.push('cleanup'));

            handleFileRetry(makeTrackExpenseRetry(), file, dismissError, setShouldShowErrorModal);

            expect(dismissError).toHaveBeenCalledTimes(1);
            expect(TrackExpense.trackExpense).toHaveBeenCalledWith(
                expect.objectContaining({
                    isRetry: true,
                    shouldPlaySound: false,
                    transactionParams: expect.objectContaining({receipt: file}),
                }),
            );
            // Cleanup MUST fire after the action, never before
            expect(callOrder).toEqual(['trackExpense', 'cleanup']);
            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
                draftTransactionIDs: ['txn-track-1'],
                linkedTrackedExpenseReportAction: undefined,
            });
        });

        it('passes linkedTrackedExpenseReportAction through to cleanup so the move-from-track child report screen is popped', () => {
            const linkedTrackedExpenseReportAction = {childReportID: 'child-1'} as ReportAction;

            handleFileRetry(
                makeTrackExpenseRetry({
                    transactionParams: {amount: 500, currency: 'USD', created: '2026-04-20', linkedTrackedExpenseReportAction},
                }),
                file,
                dismissError,
                setShouldShowErrorModal,
            );

            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    linkedTrackedExpenseReportAction,
                }),
            );
        });

        it('passes undefined draftTransactionIDs when existingTransaction is missing (helper tolerates undefined)', () => {
            handleFileRetry(makeTrackExpenseRetry({existingTransaction: undefined}), file, dismissError, setShouldShowErrorModal);

            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    draftTransactionIDs: undefined,
                }),
            );
        });
    });

    describe('MONEY_REQUEST retry', () => {
        it('calls requestMoney with isRetry=true, then cleanupAfterExpenseCreate with the existing draft transactionID', () => {
            const callOrder: string[] = [];
            (TrackExpense.requestMoney as jest.Mock).mockImplementation(() => callOrder.push('requestMoney'));
            (cleanupAfterExpenseCreate as jest.Mock).mockImplementation(() => callOrder.push('cleanup'));

            handleFileRetry(makeMoneyRequestRetry(), file, dismissError, setShouldShowErrorModal);

            expect(dismissError).toHaveBeenCalledTimes(1);
            expect(TrackExpense.requestMoney).toHaveBeenCalledWith(
                expect.objectContaining({
                    isRetry: true,
                    shouldPlaySound: false,
                    transactionParams: expect.objectContaining({receipt: file}),
                }),
            );
            expect(callOrder).toEqual(['requestMoney', 'cleanup']);
            expect(cleanupAfterExpenseCreate).toHaveBeenCalledWith({
                draftTransactionIDs: ['txn-money-1'],
                linkedTrackedExpenseReportAction: undefined,
            });
        });
    });

    describe('non-expense-creation branches', () => {
        it('does NOT call cleanupAfterExpenseCreate for REPLACE_RECEIPT (different scope — no transaction created)', () => {
            const message = {action: CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT, retryParams: {} as IOU.ReplaceReceipt} as ReceiptError;

            handleFileRetry(message, file, dismissError, setShouldShowErrorModal);

            expect(replaceReceipt).toHaveBeenCalledTimes(1);
            expect(cleanupAfterExpenseCreate).not.toHaveBeenCalled();
        });

        it('does NOT call cleanupAfterExpenseCreate for START_SPLIT_BILL (different scope — split flows handled separately)', () => {
            const message = {action: CONST.IOU.ACTION_PARAMS.START_SPLIT_BILL, retryParams: {} as IOU.StartSplitBilActionParams} as ReceiptError;

            handleFileRetry(message, file, dismissError, setShouldShowErrorModal);

            expect(startSplitBill).toHaveBeenCalledTimes(1);
            expect(cleanupAfterExpenseCreate).not.toHaveBeenCalled();
        });
    });
});
