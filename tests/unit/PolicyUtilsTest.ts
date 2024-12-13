import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
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
    describe('getActivePolicies', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
                initialKeyStates: {
                    [ONYXKEYS.SESSION]: {accountID: CARLOS_ACCOUNT_ID, email: CARLOS_EMAIL},
                },
            });
        });

        beforeEach(() => {
            global.fetch = TestHelper.getGlobalFetchMock();
            return Onyx.clear().then(waitForBatchedUpdates);
        });
        it('should return empty array', () => {
            // Given a user with a single archived paid policy.
            const policies = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    role: '',
                },
            };
            const result = PolicyUtils.getActivePolicies(policies as OnyxCollection<Policy>, true);
            // The result should be an empty array since we have no active policies.
            expect(result.length).toBe(0);
        });
        it('should return array contains policy which has id = 1', () => {
            // Given a user with only a paid policy.
            const randomPolicy1 = {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), pendingAction: null};
            const policies = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                1: randomPolicy1,
            };
            const result = PolicyUtils.getActivePolicies(policies as OnyxCollection<Policy>, true);
            // The result should contain the mock paid policy, since it is our only active paid policy.
            expect(result).toContainEqual(randomPolicy1);
        });
        it('should return empty array', () => {
            // Given a user with only one control workspace which is pending delete.
            const policies = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                1: {
                    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            };
            const result = PolicyUtils.getActivePolicies(policies as OnyxCollection<Policy>, true);
            // The result should be an empty array since there is only one policy which is pending deletion, so we have no active paid policies.
            expect(result).toEqual([]);
        });
    });
});
