import getDistanceInMeters from '@libs/TransactionUtils/getDistanceInMeters';
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Transaction} from '@src/types/onyx';

const METERS_TO_KM = 0.001;
const METERS_TO_MILES = 0.000621371;

function buildTransaction(overrides: Partial<Transaction>): OnyxInputOrEntry<Transaction> {
    return overrides as OnyxInputOrEntry<Transaction>;
}

describe('getDistanceInMeters', () => {
    it('returns route distance when only routes.route0.distance is available', () => {
        const transaction = buildTransaction({
            routes: {
                route0: {
                    distance: 5000,
                    geometry: {coordinates: [], type: 'LineString'},
                },
            },
        });

        expect(getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(5000);
    });

    it('returns converted customUnit.quantity when only quantity is available', () => {
        const quantityInMiles = 3.1;
        const expectedMeters = quantityInMiles / METERS_TO_MILES;

        const transaction = buildTransaction({
            comment: {
                customUnit: {
                    quantity: quantityInMiles,
                },
            },
        });

        expect(getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(expectedMeters);
    });

    it('returns 0 when neither route distance nor customUnit.quantity is available', () => {
        const transaction = buildTransaction({});
        expect(getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(0);
    });

    it('prefers customUnit.quantity over route distance when both are present', () => {
        const routeDistanceMeters = 5000;
        const manuallyUpdatedQuantityMiles = 10;
        const expectedMeters = manuallyUpdatedQuantityMiles / METERS_TO_MILES;

        const transaction = buildTransaction({
            routes: {
                route0: {
                    distance: routeDistanceMeters,
                    geometry: {coordinates: [], type: 'LineString'},
                },
            },
            comment: {
                customUnit: {
                    quantity: manuallyUpdatedQuantityMiles,
                },
            },
        });

        const result = getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
        expect(result).toBe(expectedMeters);
        expect(result).not.toBe(routeDistanceMeters);
    });

    it('falls back to route distance when customUnit.quantity is not set', () => {
        const transaction = buildTransaction({
            routes: {
                route0: {
                    distance: 8000,
                    geometry: {coordinates: [], type: 'LineString'},
                },
            },
            comment: {
                customUnit: {},
            },
        });

        expect(getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(8000);
    });

    it('converts customUnit.quantity using kilometers when unit is km', () => {
        const quantityInKm = 5;
        const expectedMeters = quantityInKm / METERS_TO_KM;

        const transaction = buildTransaction({
            comment: {
                customUnit: {
                    quantity: quantityInKm,
                },
            },
        });

        expect(getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS)).toBe(expectedMeters);
    });
});
