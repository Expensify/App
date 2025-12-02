import {randAmount, randBoolean, randPastDate, randWord} from '@ngneat/falso';
import {format} from 'date-fns';
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
        created: format(randPastDate(), CONST.DATE.FNS_DB_FORMAT_STRING),
        reportID: index.toString(),
        reportName: randWord(),
    };
}
