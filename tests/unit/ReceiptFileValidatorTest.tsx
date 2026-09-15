import {render} from '@testing-library/react-native';

import ReceiptFileValidator from '@pages/iou/request/step/confirmation/ReceiptFileValidator';

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

async function getValidatedReceiptState(transaction: Transaction, canEnterScanFieldsManually: boolean) {
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
            report={undefined}
            participants={[]}
            draftTransactionIDs={[TRANSACTION_ID]}
            isReceiptReady
            canEnterScanFieldsManually={canEnterScanFieldsManually}
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

    it('keeps SmartScan on surfaces that do not expose the scan fields', async () => {
        const transaction = createScanDraft({amount: 1234, isAmountSet: true, merchant: 'Starbucks', isMerchantSet: true, isCreatedSet: true});
        expect(await getValidatedReceiptState(transaction, false)).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
    });
});
