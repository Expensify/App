import getPolicyFromSearchData from '@libs/getPolicyFromSearchData';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import createRandomPolicy from '../utils/collections/policies';

const policy: Policy = {...createRandomPolicy(1), id: 'policy-1'};
const data: SearchResults['data'] = {};
data[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`] = policy;

describe('getPolicyFromSearchData', () => {
    it('returns the policy matching the policy ID', () => {
        expect(getPolicyFromSearchData(data, policy.id)).toBe(policy);
    });

    it('returns undefined when no policy matches the policy ID', () => {
        expect(getPolicyFromSearchData(data, 'missing')).toBeUndefined();
    });

    it('returns undefined when the data is undefined', () => {
        expect(getPolicyFromSearchData(undefined, policy.id)).toBeUndefined();
    });

    it('returns undefined for an empty policy ID instead of resolving the whole collection', () => {
        expect(getPolicyFromSearchData(data, '')).toBeUndefined();
    });

    it('returns undefined when the policy ID is undefined', () => {
        expect(getPolicyFromSearchData(data, undefined)).toBeUndefined();
    });
});
