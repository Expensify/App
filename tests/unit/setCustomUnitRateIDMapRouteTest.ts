import {setCustomUnitRateID} from '@libs/actions/IOU/MoneyRequest';
import hasManualMapDistanceOverride from '@libs/TransactionUtils/hasManualMapDistanceOverride';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const TRANSACTION_ID = '1';
const ROUTE_DISTANCE_METERS = 223288.344;
const KM_RATE_ID = 'km-rate';

const kilometerPolicy: Policy = {
    ...createRandomPolicy(1),
    customUnits: {
        distance: {
            customUnitID: 'distance',
            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
            attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS},
            rates: {[KM_RATE_ID]: {customUnitRateID: KM_RATE_ID, name: 'Default Rate', rate: 50, currency: 'USD', enabled: true}},
        },
    },
};

function buildReusedRouteDraft(quantity: number): Transaction {
    return {
        ...createRandomTransaction(1),
        transactionID: TRANSACTION_ID,
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
        isReusedRoute: true,
        comment: {
            customUnit: {quantity, distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, routeDistanceMeters: ROUTE_DISTANCE_METERS},
        },
        routes: {},
    };
}

async function switchToKilometerRate(transaction: Transaction) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, transaction);
    setCustomUnitRateID(TRANSACTION_ID, KM_RATE_ID, transaction, kilometerPolicy, false, undefined);
    await waitForBatchedUpdates();
    return new Promise<Transaction | undefined>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value ?? undefined);
            },
        });
    });
}

describe('setCustomUnitRateID on a map distance draft', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('converts an untouched route quantity from the route so it still matches the route', async () => {
        // Given a reused route of 223288.344 m stored as 138.74 mi
        const draft = buildReusedRouteDraft(138.74);

        // When the rate switches to one per kilometer
        const updatedDraft = await switchToKilometerRate(draft);

        // Then the quantity is the route in km rounded, 223.29, not 138.74 mi converted (223.28), which would read as a
        // typed distance and get sent to the server
        expect(updatedDraft?.comment?.customUnit?.distanceUnit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
        expect(updatedDraft?.comment?.customUnit?.quantity).toBe(223.29);
        expect(hasManualMapDistanceOverride(updatedDraft)).toBe(false);
    });

    it('keeps converting a typed distance from the typed value', async () => {
        // Given the same route with 29 mi typed on the Manual tab
        const draft = buildReusedRouteDraft(29);

        // When the rate switches to one per kilometer
        const updatedDraft = await switchToKilometerRate(draft);

        // Then the typed distance is converted on its own and still reads as typed, so it reaches the server
        expect(updatedDraft?.comment?.customUnit?.quantity).toBeCloseTo(46.67, 2);
        expect(hasManualMapDistanceOverride(updatedDraft)).toBe(true);
    });
});
