import {rand, randAmount, randBoolean, randNumber, randPastDate, randWord} from '@ngneat/falso';
import {format} from 'date-fns';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

export default function createRandomTransaction(index: number): Transaction {
    return {
        amount: randAmount(),
        bank: randWord(),
        cardID: randNumber(),
        cardName: randWord(),
        cardNumber: randWord(),
        billable: randBoolean(),
        category: randWord(),
        comment: {
            comment: randWord(),
            waypoints: {
                [randWord()]: {
                    address: randWord(),
                    lat: index,
                    lng: index,
                    name: randWord(),
                },
            },
        },
        filename: randWord(),
        managedCard: randBoolean(),
        created: format(randPastDate(), CONST.DATE.FNS_DB_FORMAT_STRING),
        modifiedCreated: '',
        currency: CONST.CURRENCY.USD,
        modifiedCurrency: '',
        merchant: randWord(),
        modifiedMerchant: randWord(),
        originalAmount: randAmount(),
        originalCurrency: rand(Object.values(CONST.CURRENCY)),
        pendingAction: rand(Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        reportID: index.toString(),
        transactionID: index.toString(),
        tag: randWord(),
        parentTransactionID: index.toString(),
        status: rand(Object.values(CONST.TRANSACTION.STATUS)),
        receipt: {},
        reimbursable: randBoolean(),
        hasEReceipt: randBoolean(),
    };
}
