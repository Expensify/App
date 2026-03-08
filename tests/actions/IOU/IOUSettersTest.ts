import Onyx from 'react-native-onyx';
import {
    addSubrate,
    clearSubrates,
    computePerDiemExpenseAmount,
    removeSubrate,
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
    updateSubrate,
} from '@libs/actions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const TRANSACTION_ID = 'test-txn-1';

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
        it('should set trimmed comment on a draft transaction', async () => {
            setMoneyRequestDescription(TRANSACTION_ID, '  Test description  ', true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.comment?.comment).toBe('Test description');
        });

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
});

describe('computePerDiemExpenseAmount', () => {
    it('should compute total amount from subRates', () => {
        const customUnit: TransactionCustomUnit = {
            subRates: [
                {id: '1', quantity: 2, name: 'Full Day', rate: 10000},
                {id: '2', quantity: 1, name: 'Half Day', rate: 5000},
            ],
        };
        // 2 * 10000 + 1 * 5000 = 25000
        expect(computePerDiemExpenseAmount(customUnit)).toBe(25000);
    });

    it('should return 0 when subRates is empty', () => {
        const customUnit: TransactionCustomUnit = {
            subRates: [],
        };
        expect(computePerDiemExpenseAmount(customUnit)).toBe(0);
    });

    it('should return 0 when subRates is undefined', () => {
        const customUnit: TransactionCustomUnit = {};
        expect(computePerDiemExpenseAmount(customUnit)).toBe(0);
    });

    it('should handle single subRate', () => {
        const customUnit: TransactionCustomUnit = {
            subRates: [{id: '1', quantity: 3, name: 'Meals', rate: 2500}],
        };
        expect(computePerDiemExpenseAmount(customUnit)).toBe(7500);
    });
});

describe('Subrate operations', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    function createTransactionWithSubrates(subRates: Array<{id: string; quantity: number; name: string; rate: number}>): Transaction {
        const transaction = createRandomTransaction(1);
        transaction.transactionID = TRANSACTION_ID;
        transaction.comment = {
            ...transaction.comment,
            customUnit: {
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                subRates,
            },
        };
        return transaction;
    }

    describe('addSubrate', () => {
        it('should add a subrate at the correct index', async () => {
            const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            addSubrate(transaction, '1', 2, '2', 'Day 2', 5000);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(2);
            expect(subRates.at(1)).toEqual(expect.objectContaining({id: '2', quantity: 2, name: 'Day 2', rate: 5000}));
        });

        it('should not add subrate when index is -1', async () => {
            const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            addSubrate(transaction, '-1', 2, '2', 'Day 2', 5000);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(1);
        });

        it('should not add subrate when index does not match the length', async () => {
            const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            // index 0 !== length 1, should not add
            addSubrate(transaction, '0', 2, '2', 'Day 2', 5000);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(1);
        });

        it('should add first subrate when transaction has no existing subrates', async () => {
            const transaction = createRandomTransaction(1);
            transaction.transactionID = TRANSACTION_ID;
            transaction.comment = {...transaction.comment, customUnit: {name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}};
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            addSubrate(transaction, '0', 1, '1', 'Day 1', 10000);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(1);
            expect(subRates.at(0)).toEqual(expect.objectContaining({id: '1', quantity: 1, name: 'Day 1', rate: 10000}));
        });
    });

    describe('removeSubrate', () => {
        it('should remove a subrate at the specified index', async () => {
            const transaction = createTransactionWithSubrates([
                {id: '1', quantity: 1, name: 'Day 1', rate: 10000},
                {id: '2', quantity: 2, name: 'Day 2', rate: 5000},
            ]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            removeSubrate(transaction, '0');
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(1);
            expect(subRates.at(0)).toEqual(expect.objectContaining({id: '2'}));
        });

        it('should not remove subrate when index is -1', async () => {
            const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            removeSubrate(transaction, '-1');
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(1);
        });
    });

    describe('updateSubrate', () => {
        it('should update a subrate at the specified index', async () => {
            const transaction = createTransactionWithSubrates([
                {id: '1', quantity: 1, name: 'Day 1', rate: 10000},
                {id: '2', quantity: 2, name: 'Day 2', rate: 5000},
            ]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            updateSubrate(transaction, '1', 3, '2', 'Day 2 Updated', 7500);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(2);
            expect(subRates.at(1)).toEqual(expect.objectContaining({id: '2', quantity: 3, name: 'Day 2 Updated', rate: 7500}));
        });

        it('should not update when index is -1', async () => {
            const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            updateSubrate(transaction, '-1', 3, '1', 'Updated', 7500);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates.at(0)).toEqual(expect.objectContaining({name: 'Day 1', rate: 10000}));
        });

        it('should not update when index is out of bounds', async () => {
            const transaction = createTransactionWithSubrates([{id: '1', quantity: 1, name: 'Day 1', rate: 10000}]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            updateSubrate(transaction, '5', 3, '1', 'Updated', 7500);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            const subRates = draft?.comment?.customUnit?.subRates ?? [];
            expect(subRates).toHaveLength(1);
            expect(subRates.at(0)).toEqual(expect.objectContaining({name: 'Day 1'}));
        });
    });

    describe('clearSubrates', () => {
        it('should clear all subrates on a transaction draft', async () => {
            const transaction = createTransactionWithSubrates([
                {id: '1', quantity: 1, name: 'Day 1', rate: 10000},
                {id: '2', quantity: 2, name: 'Day 2', rate: 5000},
            ]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
            await waitForBatchedUpdates();

            clearSubrates(TRANSACTION_ID);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);
            expect(draft?.comment?.customUnit?.subRates).toEqual([]);
        });
    });
});
