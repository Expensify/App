import {rand, randAmount, randBoolean, randPastDate, randWord} from '@ngneat/falso';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

export default function createRandomTransaction(index: number): Transaction {
    return {
        amount: randAmount(),
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
        attendees: [{email: randWord()}],
        created: randPastDate().toISOString(),
        currency: CONST.CURRENCY.USD,
        merchant: randWord(),
        modifiedMerchant: randWord(),
        pendingAction: rand(Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
        reportID: index.toString(),
        transactionID: index.toString(),
        tag: randWord(),
        parentTransactionID: index.toString(),
        status: rand(Object.values(CONST.TRANSACTION.STATUS)),
    };
}
