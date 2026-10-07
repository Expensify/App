import {isWaypointEmpty} from '@libs/TransactionUtils';

import type {Waypoint} from '@src/types/onyx/Transaction';

// The real hybrid app module needs a native TurboModule that is not available in Jest.
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: () => false, getCurrentAdvisor: jest.fn()},
}));

const startWaypoint: Waypoint = {keyForList: 'start', address: '1 Main St', lat: 40.7128, lng: -74.006};
describe('isWaypointEmpty', () => {
    it('treats undefined as empty', () => {
        expect(isWaypointEmpty(undefined)).toBe(true);
    });

    it('treats a waypoint with only keyForList as empty', () => {
        expect(isWaypointEmpty({keyForList: 'foo'})).toBe(true);
    });

    it('treats a waypoint with an address as non-empty', () => {
        expect(isWaypointEmpty(startWaypoint)).toBe(false);
    });
});
