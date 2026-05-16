import Onyx from 'react-native-onyx';
import {
    setMoneyRequestAmount,
    setMoneyRequestBillable,
    setMoneyRequestCreated,
    setMoneyRequestCurrency,
    setMoneyRequestDescription,
    setMoneyRequestMerchant,
    setMoneyRequestReimbursable,
    setMoneyRequestTag,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
} from '@libs/actions/IOU';
import {resetSplitShares, setSplitShares} from '@libs/actions/IOU/Split';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'test-txn-1';
const USER_ACCOUNT_ID = 1;
const PARTICIPANT_ACCOUNT_ID = 2;

describe('IOU setter functions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('setMoneyRequestAmount', () => {
        it('should set amount and currency on a transaction draft', async () => {
            setMoneyRequestAmount(TRANSACTION_ID, 5000, 'USD');
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.amount).toBe(5000);
            expect(draft?.currency).toBe('USD');
            expect(draft?.shouldShowOriginalAmount).toBe(false);
        });

        it('should set shouldShowOriginalAmount when specified', async () => {
            setMoneyRequestAmount(TRANSACTION_ID, 3000, 'EUR', true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.amount).toBe(3000);
            expect(draft?.currency).toBe('EUR');
            expect(draft?.shouldShowOriginalAmount).toBe(true);
        });
    });

    describe('setMoneyRequestBillable', () => {
        it('should set billable to true on a transaction draft', async () => {
            setMoneyRequestBillable(TRANSACTION_ID, true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.billable).toBe(true);
        });

        it('should set billable to false on a transaction draft', async () => {
            setMoneyRequestBillable(TRANSACTION_ID, false);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.billable).toBe(false);
        });
    });

    describe('setMoneyRequestCreated', () => {
        it('should set created date on a transaction draft', async () => {
            setMoneyRequestCreated(TRANSACTION_ID, '2024-01-15', true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.created).toBe('2024-01-15');
        });

        it('should set created date on a real transaction when isDraft is false', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setMoneyRequestCreated(TRANSACTION_ID, '2024-06-01', false);
            await waitForBatchedUpdates();

            const updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
            expect(updated?.created).toBe('2024-06-01');
        });
    });

    describe('setMoneyRequestCurrency', () => {
        it('should set currency on a transaction draft', async () => {
            setMoneyRequestCurrency(TRANSACTION_ID, 'GBP');
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.currency).toBe('GBP');
        });

        it('should set modifiedCurrency when isEditing is true', async () => {
            setMoneyRequestCurrency(TRANSACTION_ID, 'JPY', true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.modifiedCurrency).toBe('JPY');
        });
    });

    describe('setMoneyRequestDescription', () => {
        it('should set comment on a real transaction when isDraft is false', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setMoneyRequestDescription(TRANSACTION_ID, 'Lunch with team', false);
            await waitForBatchedUpdates();

            const updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
            expect(updated?.comment?.comment).toBe('Lunch with team');
        });
    });

    describe('setMoneyRequestMerchant', () => {
        it('should set merchant on a draft transaction', async () => {
            setMoneyRequestMerchant(TRANSACTION_ID, 'Starbucks', true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.merchant).toBe('Starbucks');
        });

        it('should set merchant on a real transaction when isDraft is false', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setMoneyRequestMerchant(TRANSACTION_ID, 'Amazon', false);
            await waitForBatchedUpdates();

            const updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
            expect(updated?.merchant).toBe('Amazon');
        });
    });

    describe('setMoneyRequestTag', () => {
        it('should set tag on a transaction draft', async () => {
            setMoneyRequestTag(TRANSACTION_ID, 'Engineering');
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.tag).toBe('Engineering');
        });
    });

    describe('setMoneyRequestTaxAmount', () => {
        it('should set taxAmount on a draft transaction by default', async () => {
            setMoneyRequestTaxAmount(TRANSACTION_ID, 500);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.taxAmount).toBe(500);
        });

        it('should set taxAmount to null', async () => {
            setMoneyRequestTaxAmount(TRANSACTION_ID, null);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.taxAmount ?? null).toBeNull();
        });

        it('should set taxAmount on a real transaction when isDraft is false', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setMoneyRequestTaxAmount(TRANSACTION_ID, 750, false);
            await waitForBatchedUpdates();

            const updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
            expect(updated?.taxAmount).toBe(750);
        });
    });

    describe('setMoneyRequestTaxRate', () => {
        it('should set taxCode on a draft transaction by default', async () => {
            setMoneyRequestTaxRate(TRANSACTION_ID, 'TAX_10');
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.taxCode).toBe('TAX_10');
        });

        it('should set taxCode to null', async () => {
            setMoneyRequestTaxRate(TRANSACTION_ID, null);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.taxCode ?? null).toBeNull();
        });

        it('should set taxCode on a real transaction when isDraft is false', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setMoneyRequestTaxRate(TRANSACTION_ID, 'TAX_20', false);
            await waitForBatchedUpdates();

            const updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
            expect(updated?.taxCode).toBe('TAX_20');
        });
    });

    describe('setMoneyRequestReimbursable', () => {
        it('should set reimbursable on a transaction draft', async () => {
            setMoneyRequestReimbursable(TRANSACTION_ID, true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.reimbursable).toBe(true);
        });

        it('should set reimbursable to false', async () => {
            setMoneyRequestReimbursable(TRANSACTION_ID, false);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.reimbursable).toBe(false);
        });
    });

    describe('setSplitShares', () => {
        function createTransactionWithSplitShares(): Transaction {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            transaction.amount = 10000;
            transaction.currency = 'USD';
            transaction.splitShares = {
                [USER_ACCOUNT_ID]: {amount: 5000, isModified: false},
                [PARTICIPANT_ACCOUNT_ID]: {amount: 5000, isModified: false},
            };
            return transaction;
        }

        beforeEach(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: USER_ACCOUNT_ID});
            await waitForBatchedUpdates();
        });

        it('should write splitShares to TRANSACTION_DRAFT by default', async () => {
            const transaction = createTransactionWithSplitShares();
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setSplitShares(transaction, 10000, 'USD', [USER_ACCOUNT_ID, PARTICIPANT_ACCOUNT_ID]);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.splitShares).toBeDefined();
            expect(draft?.splitShares?.[USER_ACCOUNT_ID]).toBeDefined();
            expect(draft?.splitShares?.[PARTICIPANT_ACCOUNT_ID]).toBeDefined();
        });

        it('should write splitShares to TRANSACTION when isDraft is false', async () => {
            const transaction = createTransactionWithSplitShares();
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setSplitShares(transaction, 10000, 'USD', [USER_ACCOUNT_ID, PARTICIPANT_ACCOUNT_ID], false);
            await waitForBatchedUpdates();

            const updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
            expect(updated?.splitShares).toBeDefined();
            expect(updated?.splitShares?.[USER_ACCOUNT_ID]).toBeDefined();
            expect(updated?.splitShares?.[PARTICIPANT_ACCOUNT_ID]).toBeDefined();
        });

        it('should not create an orphaned TRANSACTION_DRAFT entry when isDraft is false', async () => {
            const transaction = createTransactionWithSplitShares();
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            setSplitShares(transaction, 8000, 'USD', [USER_ACCOUNT_ID, PARTICIPANT_ACCOUNT_ID], false);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft).toBeUndefined();
        });

        it('should do nothing when transaction is null', async () => {
            setSplitShares(undefined, 10000, 'USD', [USER_ACCOUNT_ID, PARTICIPANT_ACCOUNT_ID]);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft).toBeUndefined();
        });
    });

    describe('resetSplitShares', () => {
        beforeEach(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: USER_ACCOUNT_ID});
            await waitForBatchedUpdates();
        });

        it('should reset splitShares on TRANSACTION_DRAFT by default', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            transaction.amount = 6000;
            transaction.currency = 'USD';
            transaction.splitShares = {
                [USER_ACCOUNT_ID]: {amount: 3000, isModified: false},
                [PARTICIPANT_ACCOUNT_ID]: {amount: 3000, isModified: false},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            resetSplitShares(transaction, 8000, 'USD');
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.splitShares).toBeDefined();
            expect(draft?.splitShares?.[USER_ACCOUNT_ID]).toBeDefined();
            expect(draft?.splitShares?.[PARTICIPANT_ACCOUNT_ID]).toBeDefined();
        });

        it('should reset splitShares on TRANSACTION when isDraft is false', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            transaction.amount = 6000;
            transaction.currency = 'USD';
            transaction.splitShares = {
                [USER_ACCOUNT_ID]: {amount: 3000, isModified: false},
                [PARTICIPANT_ACCOUNT_ID]: {amount: 3000, isModified: false},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            resetSplitShares(transaction, 8000, 'USD', false);
            await waitForBatchedUpdates();

            const updated = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`);
            expect(updated?.splitShares).toBeDefined();
            expect(updated?.splitShares?.[USER_ACCOUNT_ID]).toBeDefined();
            expect(updated?.splitShares?.[PARTICIPANT_ACCOUNT_ID]).toBeDefined();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft).toBeUndefined();
        });
    });
});
