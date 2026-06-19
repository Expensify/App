import {shouldFailAllRequestsSelector} from '@selectors/Network';
import type {OnyxEntry} from 'react-native-onyx';
import type {Network} from '@src/types/onyx';

describe('shouldFailAllRequestsSelector', () => {
    it('returns true when shouldFailAllRequests is true', () => {
        const network: OnyxEntry<Network> = {shouldFailAllRequests: true};
        expect(shouldFailAllRequestsSelector(network)).toBe(true);
    });

    it('returns false when shouldFailAllRequests is false', () => {
        const network: OnyxEntry<Network> = {shouldFailAllRequests: false};
        expect(shouldFailAllRequestsSelector(network)).toBe(false);
    });

    it('returns false when shouldFailAllRequests is not set', () => {
        const network: OnyxEntry<Network> = {};
        expect(shouldFailAllRequestsSelector(network)).toBe(false);
    });

    it('returns false when network is undefined', () => {
        expect(shouldFailAllRequestsSelector(undefined)).toBe(false);
    });
});
