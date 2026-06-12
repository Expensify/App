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
            attendees: [{email: randWord(), displayName: 'Test User', avatarUrl: ''}],
        },
        managedCard: randBoolean(),
        created: format(randPastDate(), CONST.DATE.FNS_DB_FORMAT_STRING),
        modifiedCreated: '',
        currency: CONST.CURRENCY.USD,
        modifiedCurrency: '',
        merchant: randWord(),
        modifiedMerchant: randWord(),
        originalAmount: randAmount(),
        originalCurrency: rand(Object.values(CONST.CURRENCY)),
        reportID: index.toString(),
        transactionID: index.toString(),
        tag: randWord(),
        parentTransactionID: index.toString(),
        status: rand(Object.values(CONST.TRANSACTION.STATUS)),
        receipt: {filename: randWord()},
        reimbursable: randBoolean(),
        hasEReceipt: randBoolean(),
        modifiedAmount: '',
    };
}

const createRandomDistanceRequestTransaction = (index: number, shouldIncludeWaypoints = false): Transaction => {
    const fakeWayPoints = {
        waypoint0: {
            keyForList: '88 Kearny Street_1735023533854',
            lat: 37.7886378,
            lng: -122.4033442,
            address: '88 Kearny Street, San Francisco, CA, USA',
            name: '88 Kearny Street',
        },
        waypoint1: {
            keyForList: 'Golden Gate Bridge Vista Point_1735023537514',
            lat: 37.8077876,
            lng: -122.4752007,
            address: 'Golden Gate Bridge Vista Point, San Francisco, CA, USA',
            name: 'Golden Gate Bridge Vista Point',
        },
    };

    const randomTransaction = createRandomTransaction(index);
    return {
        ...randomTransaction,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
        comment: {
            ...randomTransaction.comment,
            type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            customUnit: {
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            },
            ...(shouldIncludeWaypoints ? {waypoints: fakeWayPoints} : {}),
        },
    };
};

export {createRandomDistanceRequestTransaction};
