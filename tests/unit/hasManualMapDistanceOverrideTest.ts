import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import hasManualMapDistanceOverride from '@pages/iou/request/step/confirmation/submission/utils/hasManualMapDistanceOverride';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

const MILES = CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
const toMeters = (miles: number) => DistanceRequestUtils.convertToDistanceInMeters(miles, MILES);

function buildMapTransaction({
    quantity,
    routes,
    selectedRouteKey,
    routeDistanceMeters,
}: {
    quantity?: number;
    routes?: Record<string, number>;
    selectedRouteKey?: string;
    routeDistanceMeters?: number;
}) {
    return {
        transactionID: '1',
        iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
        comment: {
            selectedRouteKey,
            customUnit: {quantity, distanceUnit: MILES, routeDistanceMeters},
        },
        routes: Object.fromEntries(Object.entries(routes ?? {}).map(([key, distance]) => [key, {distance, geometry: {coordinates: []}}])),
    } as unknown as Transaction;
}

describe('hasManualMapDistanceOverride', () => {
    it('returns false when the quantity is the rounded route distance', () => {
        // Given a quantity that is the route distance rounded to two decimals, the way the app stores route quantities
        const transaction = buildMapTransaction({quantity: 2907.36, routes: {route0: toMeters(2907.358)}});

        // When it is checked for an override
        const result = hasManualMapDistanceOverride(transaction);

        // Then it is not an override, so no distance is sent and the server keeps using the route
        expect(result).toBe(false);
    });

    it('returns true for a correction smaller than the old tolerance', () => {
        // Given a route of 2907.358 mi shown as 2907.36, and the user typing 2907.35 on the Manual tab
        const transaction = buildMapTransaction({quantity: 2907.35, routes: {route0: toMeters(2907.358)}});

        // When it is checked for an override
        const result = hasManualMapDistanceOverride(transaction);

        // Then it is an override, because a one-cent difference is still a value the user typed and has to reach the server
        expect(result).toBe(true);
    });

    it('returns true when there is no route yet', () => {
        // Given an offline draft whose route is still pending but already has a typed quantity
        const transaction = buildMapTransaction({quantity: 12});

        // When it is checked for an override
        const result = hasManualMapDistanceOverride(transaction);

        // Then it is an override, because without a route the quantity can only have come from the Manual tab
        expect(result).toBe(true);
    });

    it('returns false when the quantity matches the selected alternate route', () => {
        // Given an alternate route the user picked on the map, which writes that route's distance into the quantity
        const transaction = buildMapTransaction({quantity: 15, routes: {route0: toMeters(10), route1: toMeters(15)}, selectedRouteKey: 'route1'});

        // When it is checked for an override
        const result = hasManualMapDistanceOverride(transaction);

        // Then it is not an override, because comparing against route0 alone would turn every alternate route pick into one
        expect(result).toBe(false);
    });

    it('returns false for a draft that is not a map distance request', () => {
        // Given a manual distance draft, which always sends its distance on its own
        const transaction = {...buildMapTransaction({quantity: 12}), iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL};

        // When it is checked for an override
        const result = hasManualMapDistanceOverride(transaction);

        // Then it is not treated as a map override
        expect(result).toBe(false);
    });
});
