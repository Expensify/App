import {render} from '@testing-library/react-native';

import validateReceiptFile from '@libs/fileDownload/validateReceiptFile';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';

import ReceiptFileValidator from '@pages/iou/request/step/confirmation/ReceiptFileValidator';

import {setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import {removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Stand in for reading the receipt back off disk: the validator only cares that the file is accessible.
jest.mock('@libs/fileDownload/validateReceiptFile', () => ({
    __esModule: true,
    default: jest.fn((receiptFilename: string, receiptPath: string, _receiptType: string, onSuccess: (file: {name: string; uri: string}) => void) => {
        onSuccess({name: receiptFilename, uri: receiptPath});
        return Promise.resolve();
    }),
}));

jest.mock('@libs/IOUUtils', () => ({navigateToStartMoneyRequestStep: jest.fn()}));
jest.mock('@userActions/IOU/Receipt', () => ({setMoneyRequestReceipt: jest.fn()}));
jest.mock('@userActions/TransactionEdit', () => ({removeDraftTransactionsByIDs: jest.fn()}));

const TRANSACTION_ID = '1';

function createScanDraft(values: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: '1',
        amount: 0,
        currency: 'USD',
        created: '2025-01-15',
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        comment: {},
        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
        // A local file, the way a freshly captured or dropped receipt is stored before submission
        receipt: {filename: 'receipt.jpg', source: 'file://receipt.jpg', state: CONST.IOU.RECEIPT_STATE.SCAN_READY},
        ...values,
    };
}

function renderValidator(transactions: Transaction[], onReceiptFilesChange: (files: Record<string, Receipt>) => void, isReceiptReady = true) {
    return (
        <ReceiptFileValidator
            transactions={transactions}
            requestType={CONST.IOU.REQUEST_TYPE.SCAN}
            iouType={CONST.IOU.TYPE.SUBMIT}
            initialTransactionID={TRANSACTION_ID}
            reportID="1"
            action={CONST.IOU.ACTION.CREATE}
            backToReport={undefined}
            draftTransactionIDs={transactions.map(({transactionID}) => transactionID)}
            isReceiptReady={isReceiptReady}
            canEnterScanFieldsManually
            isPolicyExpenseChat
            onReceiptFilesChange={onReceiptFilesChange}
        />
    );
}

async function getValidatedReceiptState(transaction: Transaction, canEnterScanFieldsManually: boolean, isPolicyExpenseChat = true) {
    let receiptFiles: Record<string, Receipt> = {};
    render(
        <ReceiptFileValidator
            transactions={[transaction]}
            requestType={CONST.IOU.REQUEST_TYPE.SCAN}
            iouType={CONST.IOU.TYPE.SUBMIT}
            initialTransactionID={TRANSACTION_ID}
            reportID="1"
            action={CONST.IOU.ACTION.CREATE}
            backToReport={undefined}
            draftTransactionIDs={[TRANSACTION_ID]}
            isReceiptReady
            canEnterScanFieldsManually={canEnterScanFieldsManually}
            isPolicyExpenseChat={isPolicyExpenseChat}
            onReceiptFilesChange={(files) => {
                receiptFiles = files;
            }}
        />,
    );
    await waitForBatchedUpdatesWithAct();
    return receiptFiles[TRANSACTION_ID]?.state;
}

describe('ReceiptFileValidator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('submits an untouched scan receipt for SmartScan', async () => {
        expect(await getValidatedReceiptState(createScanDraft(), true)).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
    });

    it('submits a scan receipt whose details the user filled in as open, so SmartScan cannot overwrite them', async () => {
        const transaction = createScanDraft({amount: 1234, isAmountSet: true, merchant: 'Starbucks', isMerchantSet: true, isCreatedSet: true});
        expect(await getValidatedReceiptState(transaction, true)).toBe(CONST.IOU.RECEIPT_STATE.OPEN);
    });

    it('still scans a receipt whose details the user only partially filled in', async () => {
        expect(await getValidatedReceiptState(createScanDraft({merchant: 'Starbucks', isMerchantSet: true}), true)).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
    });

    it('submits a P2P scan receipt as open once the amount and date are filled in, since its merchant is optional', async () => {
        // Given a scan with the amount and date entered but no merchant (#101147)
        const transaction = createScanDraft({amount: 1234, isAmountSet: true, isCreatedSet: true});

        // When it goes to a chat that doesn't require a merchant
        const receiptState = await getValidatedReceiptState(transaction, true, false);

        // Then SmartScan is kept from overwriting the entered values
        expect(receiptState).toBe(CONST.IOU.RECEIPT_STATE.OPEN);
    });

    it('keeps SmartScan on surfaces that do not expose the scan fields', async () => {
        const transaction = createScanDraft({amount: 1234, isAmountSet: true, merchant: 'Starbucks', isMerchantSet: true, isCreatedSet: true});
        expect(await getValidatedReceiptState(transaction, false)).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
    });

    it('does not reread or republish receipts after unrelated draft edits or equivalent cloned inputs', async () => {
        // Given two receipts that have already been validated
        const transactions = [createScanDraft(), createScanDraft({transactionID: '2'})];
        const onReceiptFilesChange = jest.fn();
        const {rerender} = render(renderValidator(transactions, onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();
        expect(validateReceiptFile).toHaveBeenCalledTimes(2);

        // When defaults and other unused draft fields change, including a new but equivalent receipt object
        rerender(
            renderValidator(
                transactions.map((transaction) => ({...transaction, billable: true, reimbursable: true, category: 'Travel', receipt: {...transaction.receipt}})),
                onReceiptFilesChange,
            ),
        );
        await waitForBatchedUpdatesWithAct();

        // Then neither the files nor the parent state are rebuilt
        expect(validateReceiptFile).toHaveBeenCalledTimes(2);
        expect(onReceiptFilesChange).toHaveBeenCalledTimes(1);
    });

    it('revalidates when a receipt is replaced', async () => {
        // Given a validated local receipt
        const transaction = createScanDraft();
        const onReceiptFilesChange = jest.fn();
        const {rerender} = render(renderValidator([transaction], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // When the user replaces the receipt
        rerender(renderValidator([{...transaction, receipt: {...transaction.receipt, source: 'file://replacement.jpg'}}], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // Then validation reads the replacement and publishes its contents
        expect(validateReceiptFile).toHaveBeenCalledTimes(2);
        expect(onReceiptFilesChange).toHaveBeenLastCalledWith({[TRANSACTION_ID]: expect.objectContaining({uri: 'file://replacement.jpg'})});
    });

    it('revalidates when manual scan fields become complete', async () => {
        // Given a scan that still needs SmartScan
        const transaction = createScanDraft();
        const onReceiptFilesChange = jest.fn();
        const {rerender} = render(renderValidator([transaction], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // When all the manual-entry flags are set
        rerender(renderValidator([{...transaction, isAmountSet: true, isMerchantSet: true, isCreatedSet: true}], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // Then the published receipt is open so SmartScan cannot overwrite the user's details
        expect(validateReceiptFile).toHaveBeenCalledTimes(2);
        expect(onReceiptFilesChange).toHaveBeenLastCalledWith({[TRANSACTION_ID]: expect.objectContaining({state: CONST.IOU.RECEIPT_STATE.OPEN})});
    });

    it('updates receipt membership when drafts are added or removed', async () => {
        // Given one validated draft
        const transaction = createScanDraft();
        const secondTransaction = createScanDraft({transactionID: '2'});
        const onReceiptFilesChange = jest.fn<void, [Record<string, Receipt>]>();
        const {rerender} = render(renderValidator([transaction], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // When a draft is added and the original draft is later removed
        rerender(renderValidator([transaction, secondTransaction], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();
        expect(Object.keys(onReceiptFilesChange.mock.lastCall?.[0] ?? {})).toEqual(['1', '2']);
        rerender(renderValidator([secondTransaction], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // Then the result contains only the remaining draft
        expect(Object.keys(onReceiptFilesChange.mock.lastCall?.[0] ?? {})).toEqual(['2']);
    });

    it('waits for receipt readiness before reading files', async () => {
        // Given an upstream writer that has not finished preparing the receipt
        const transactions = [createScanDraft()];
        const onReceiptFilesChange = jest.fn();
        const {rerender} = render(renderValidator(transactions, onReceiptFilesChange, false));
        await waitForBatchedUpdatesWithAct();
        expect(validateReceiptFile).not.toHaveBeenCalled();

        // When the writer finishes
        rerender(renderValidator(transactions, onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // Then validation proceeds normally
        expect(validateReceiptFile).toHaveBeenCalledTimes(1);
        expect(onReceiptFilesChange).toHaveBeenCalledTimes(1);
    });

    it.each([false, true])('ignores a superseded read, including failure side effects (failure: %s)', async (shouldFail) => {
        // Given a receipt read that is still pending
        let finishRead = () => {};
        jest.mocked(validateReceiptFile).mockImplementationOnce(
            (filename, source, type, onSuccess, onFailure) =>
                new Promise<void>((resolve) => {
                    finishRead = () => {
                        if (shouldFail) {
                            onFailure();
                        } else {
                            onSuccess({name: filename, uri: 'file://receipt.jpg'});
                        }
                        resolve();
                    };
                }),
        );
        const transaction = createScanDraft();
        const onReceiptFilesChange = jest.fn();
        const {rerender} = render(renderValidator([transaction], onReceiptFilesChange));

        // When a newer receipt is validated before the old read completes
        rerender(renderValidator([{...transaction, receipt: {...transaction.receipt, source: 'file://new.jpg'}}], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();
        finishRead();
        await waitForBatchedUpdatesWithAct();

        // Then only the newer result is published, with no stale navigation or draft mutations
        expect(onReceiptFilesChange).toHaveBeenCalledTimes(1);
        expect(onReceiptFilesChange).toHaveBeenLastCalledWith({[TRANSACTION_ID]: expect.objectContaining({uri: 'file://new.jpg'})});
        expect(setMoneyRequestReceipt).not.toHaveBeenCalled();
        expect(removeDraftTransactionsByIDs).not.toHaveBeenCalled();
        expect(navigateToStartMoneyRequestStep).not.toHaveBeenCalled();
    });

    it('recovers from an unreadable current receipt', async () => {
        // Given a local receipt that can no longer be read
        jest.mocked(validateReceiptFile).mockImplementationOnce((filename, source, type, onSuccess, onFailure) => {
            onFailure();
            return Promise.resolve();
        });
        const onReceiptFilesChange = jest.fn();

        // When validation completes
        render(renderValidator([createScanDraft()], onReceiptFilesChange));
        await waitForBatchedUpdatesWithAct();

        // Then the broken draft is cleared and the user returns to the start instead of submitting it
        expect(onReceiptFilesChange).not.toHaveBeenCalled();
        expect(setMoneyRequestReceipt).toHaveBeenCalledWith(TRANSACTION_ID, '', '', true, '');
        expect(removeDraftTransactionsByIDs).toHaveBeenCalledWith([TRANSACTION_ID], true);
        expect(navigateToStartMoneyRequestStep).toHaveBeenCalledTimes(1);
    });
});
