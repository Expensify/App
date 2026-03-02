import {networkStatusSelector, shouldFailAllRequestsSelector} from '@selectors/Network';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Network} from '@src/types/onyx';

describe('shouldFailAllRequestsSelector', () => {
    it('returns true when shouldFailAllRequests is true', () => {
        const network: OnyxEntry<Network> = {isOffline: false, shouldFailAllRequests: true};
        expect(shouldFailAllRequestsSelector(network)).toBe(true);
    });

    it('returns false when shouldFailAllRequests is false', () => {
        const network: OnyxEntry<Network> = {isOffline: false, shouldFailAllRequests: false};
        expect(shouldFailAllRequestsSelector(network)).toBe(false);
    });

    it('returns false when shouldFailAllRequests is not set', () => {
        const network: OnyxEntry<Network> = {isOffline: false};
        expect(shouldFailAllRequestsSelector(network)).toBe(false);
    });

    it('returns false when network is undefined', () => {
        expect(shouldFailAllRequestsSelector(undefined)).toBe(false);
    });
});

describe('networkStatusSelector', () => {
    it('returns network status fields when network data is provided', () => {
        const network: OnyxEntry<Network> = {
            isOffline: true,
            networkStatus: CONST.NETWORK.NETWORK_STATUS.OFFLINE,
            lastOfflineAt: '2024-01-01T00:00:00Z',
        };
        expect(networkStatusSelector(network)).toEqual({
            isOffline: true,
            networkStatus: CONST.NETWORK.NETWORK_STATUS.OFFLINE,
            lastOfflineAt: '2024-01-01T00:00:00Z',
        });
    });

    it('returns default data with UNKNOWN status when network is undefined', () => {
        expect(networkStatusSelector(undefined)).toEqual({
            ...CONST.DEFAULT_NETWORK_DATA,
            networkStatus: CONST.NETWORK.NETWORK_STATUS.UNKNOWN,
        });
    });

    it('returns undefined for optional fields when not set', () => {
        const network: OnyxEntry<Network> = {isOffline: false};
        expect(networkStatusSelector(network)).toEqual({
            isOffline: false,
            networkStatus: undefined,
            lastOfflineAt: undefined,
        });
    });
});
