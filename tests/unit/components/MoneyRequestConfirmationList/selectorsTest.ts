import {merchantStateSelector, shouldReportFieldBeEditable} from '@components/MoneyRequestConfirmationList/sections/selectors';

import CONST from '@src/CONST';
import type {Report, Transaction} from '@src/types/onyx';

import createMock from '../../../utils/createMock';

function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return createMock<Transaction>({
        transactionID: 'txn1',
        amount: 100,
        currency: 'USD',
        merchant: 'Coffee Shop',
        ...overrides,
    });
}

function createReport(reportID: string): Report {
    return createMock<Report>({reportID});
}

describe('MoneyRequestConfirmationList selectors', () => {
    describe('merchantStateSelector', () => {
        it('returns undefined when transaction is undefined', () => {
            expect(merchantStateSelector(undefined)).toBeUndefined();
        });

        it('returns merchant state for a valid transaction', () => {
            const transaction = createTransaction({merchant: 'Starbucks', isMerchantSet: true});

            expect(merchantStateSelector(transaction)).toEqual({
                merchant: 'Starbucks',
                isMerchantSet: true,
                isMissing: false,
                hasReceipt: false,
                iouRequestType: undefined,
                isAmountSet: false,
                isCreatedSet: false,
            });
        });

        it('carries the sibling scan fields, which the merchant field needs for the all-or-nothing rule', () => {
            const transaction = createTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN, isAmountSet: true, isCreatedSet: true});

            expect(merchantStateSelector(transaction)).toEqual(expect.objectContaining({iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN, isAmountSet: true, isCreatedSet: true}));
        });

        it('prefers modifiedMerchant over merchant', () => {
            const transaction = createTransaction({
                merchant: 'Original Merchant',
                modifiedMerchant: 'Updated Merchant',
            });

            expect(merchantStateSelector(transaction)?.merchant).toBe('Updated Merchant');
        });

        it('defaults isMerchantSet to false when not set', () => {
            const transaction = createTransaction({merchant: 'Starbucks'});

            expect(merchantStateSelector(transaction)?.isMerchantSet).toBe(false);
        });

        it('marks default merchant values as missing', () => {
            expect(merchantStateSelector(createTransaction({merchant: CONST.TRANSACTION.DEFAULT_MERCHANT}))?.isMissing).toBe(true);
            expect(merchantStateSelector(createTransaction({merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT}))?.isMissing).toBe(true);
            expect(merchantStateSelector(createTransaction({merchant: ''}))?.isMissing).toBe(true);
        });

        it('returns hasReceipt true when transaction has a receipt state', () => {
            const transaction = createTransaction({
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE},
            });

            expect(merchantStateSelector(transaction)?.hasReceipt).toBe(true);
        });
    });

    describe('shouldReportFieldBeEditable', () => {
        it('stays disabled when the current report is the only one in the list', () => {
            // Given a single outstanding report, which is also the current report
            // When the field decides whether it can be changed
            // Then it cannot, since there is no other destination to pick
            expect(shouldReportFieldBeEditable([createReport('r1')], 'r1', false)).toBe(false);
        });

        it('becomes editable when the list holds another report besides the current one', () => {
            // Given the current report and one more outstanding report
            // When the field decides whether it can be changed
            // Then it can, since the other report can be picked
            expect(shouldReportFieldBeEditable([createReport('r1'), createReport('r2')], 'r1', false)).toBe(true);
        });

        it('becomes editable when the current report is missing from the list and one other remains', () => {
            // Given a filtered list where the current report is not present, such as a report on an approve-only workspace
            // When the field decides whether it can be changed
            // Then it can, since the remaining report is a different destination
            expect(shouldReportFieldBeEditable([createReport('r2')], 'r1', false)).toBe(true);
        });

        it('stays disabled when the current report is missing and the list is empty', () => {
            // Given a filtered list with no reports at all
            // When the field decides whether it can be changed
            // Then it cannot, since there is no destination to pick
            expect(shouldReportFieldBeEditable([], 'r1', false)).toBe(false);
        });

        it('needs only one report when the expense is unreported or goes to a new report', () => {
            // Given an unreported expense, so any outstanding report is a different destination
            // When the field decides whether it can be changed
            // Then one report in the list is enough
            expect(shouldReportFieldBeEditable([createReport('r1')], 'r1', true)).toBe(true);
            expect(shouldReportFieldBeEditable([], 'r1', true)).toBe(false);
        });
    });
});
