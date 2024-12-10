import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;
function toLocaleDigitMock(dot: string): string {
    return dot;
}

describe('PolicyUtils', () => {
    describe('getRateDisplayValue', () => {
        it('should return an empty string for NaN', () => {
            const rate = PolicyUtils.getRateDisplayValue('invalid' as unknown as number, toLocaleDigitMock);
            expect(rate).toEqual('');
        });

        describe('withDecimals = false', () => {
            it('should return integer value as is', () => {
                const rate = PolicyUtils.getRateDisplayValue(100, toLocaleDigitMock);
                expect(rate).toEqual('100');
            });

            it('should return non-integer value as is', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.5, toLocaleDigitMock);
                expect(rate).toEqual('10.5');
            });
        });

        describe('withDecimals = true', () => {
            it('should return integer value with 2 trailing zeros', () => {
                const rate = PolicyUtils.getRateDisplayValue(10, toLocaleDigitMock, true);
                expect(rate).toEqual('10.00');
            });

            it('should return non-integer value with up to 2 trailing zeros', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.5, toLocaleDigitMock, true);
                expect(rate).toEqual('10.50');
            });

            it('should return non-integer value with 4 decimals as is', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.5312, toLocaleDigitMock, true);
                expect(rate).toEqual('10.5312');
            });

            it('should return non-integer value with 3 decimals as is', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.531, toLocaleDigitMock, true);
                expect(rate).toEqual('10.531');
            });

            it('should return non-integer value with 4+ decimals cut to 4', () => {
                const rate = PolicyUtils.getRateDisplayValue(10.53135, toLocaleDigitMock, true);
                expect(rate).toEqual('10.5313');
            });
        });
    });

    describe('getUnitRateValue', () => {
        it('should return an empty string for NaN', () => {
            const rate = PolicyUtils.getUnitRateValue(toLocaleDigitMock, {rate: 'invalid' as unknown as number});
            expect(rate).toEqual('');
        });

        describe('withDecimals = false', () => {
            it('should return value divisible by 100 with no decimal places', () => {
                const rate = PolicyUtils.getUnitRateValue(toLocaleDigitMock, {rate: 100});
                expect(rate).toEqual('1');
            });

            it('should return non-integer value as is divided by 100', () => {
                const rate = PolicyUtils.getUnitRateValue(toLocaleDigitMock, {rate: 11.11});
                expect(rate).toEqual('0.1111');
            });
        });

        describe('withDecimals = true', () => {
            it('should return value divisible by 100 with 2 decimal places', () => {
                const rate = PolicyUtils.getUnitRateValue(toLocaleDigitMock, {rate: 100}, true);
                expect(rate).toEqual('1.00');
            });

            it('should return non-integer value as is divided by 100', () => {
                const rate = PolicyUtils.getUnitRateValue(toLocaleDigitMock, {rate: 11.11}, true);
                expect(rate).toEqual('0.1111');
            });
        });
    });
    describe('getFilteredPolicies', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
                initialKeyStates: {
                    // Given mock data for session
                    [ONYXKEYS.SESSION]: {accountID: CARLOS_ACCOUNT_ID, email: CARLOS_EMAIL},
                },
            });
        });

        beforeEach(() => {
            global.fetch = TestHelper.getGlobalFetchMock();
            return Onyx.clear().then(waitForBatchedUpdates);
        });
        it('should return empty array', () => {
            // Given mock data for policies
            const policies = {
                1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    role: '',
                },
            };
            // When calling getFilteredPolicies with policies
            const result = PolicyUtils.getFilteredPolicies(policies as OnyxCollection<Policy>);
            // The result should be empty array since the policies contains only one policy which does not have role field.
            expect(result.length).toBe(0);
        });
        it('should return array contains policy which has id = 1', () => {
            // Given mock data for policies
            const randomPolicy1 = createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE);
            const policies = {
                1: randomPolicy1,
            };
            // When calling getFilteredPolicies with policies
            const result = PolicyUtils.getFilteredPolicies(policies as OnyxCollection<Policy>);
            // The result should contains the policy which has id = 1 since it is a valid policy.
            expect(result).toContainEqual(randomPolicy1);
        });
        it('should return empty array', () => {
            // Given mock data for policies
            const policies = {
                1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            };
            // When calling getFilteredPolicies with policies
            const result = PolicyUtils.getFilteredPolicies(policies as OnyxCollection<Policy>);
            // The result should be empty array since the policies contains only one policy which has pendingAction is 'delete' .
            expect(result).toEqual([]);
        });
    });
});
