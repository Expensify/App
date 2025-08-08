import {randAmount, randBoolean, randWord} from '@ngneat/falso';
import CONST from '@src/CONST';
import type {MergeTransaction} from '@src/types/onyx';
import createRandomTransaction from './transaction';

export default function createRandomMergeTransaction(index: number): MergeTransaction {
    return {
        targetTransactionID: index.toString(),
        sourceTransactionID: randWord(),
        eligibleTransactions: [createRandomTransaction(0), createRandomTransaction(1)],
        amount: randAmount(),
        currency: CONST.CURRENCY.USD,
        merchant: randWord(),
        category: randWord(),
        tag: randWord(),
        description: randWord(),
        comment: {
            comment: randWord(),
        },
        reimbursable: randBoolean(),
        billable: randBoolean(),
        receipt: {},
    };
}
