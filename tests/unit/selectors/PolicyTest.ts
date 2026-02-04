import {hasMultipleOutputCurrenciesSelector} from '@selectors/Policy';
import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';

describe('hasMultipleOutputCurrenciesSelector', () => {
    it('returns false when paid group policies have the same output currency', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), outputCurrency: 'USD'},
            policy2: {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), outputCurrency: 'USD'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });

    it('returns true when paid group policies have different output currencies', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), outputCurrency: 'USD'},
            policy2: {...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE), outputCurrency: 'EUR'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(true);
    });

    it('returns false when policies object is empty', () => {
        const policies: OnyxCollection<Policy> = {};

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });

    it('returns false when there are only personal policies', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.PERSONAL), outputCurrency: 'USD'},
            policy2: {...createRandomPolicy(2, CONST.POLICY.TYPE.PERSONAL), outputCurrency: 'EUR'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });

    it('returns false when there is only a single paid group policy', () => {
        const policies: OnyxCollection<Policy> = {
            policy1: {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), outputCurrency: 'USD'},
        };

        expect(hasMultipleOutputCurrenciesSelector(policies)).toBe(false);
    });
});
