import {updateFinancialForceFxExpenseAccount} from '@libs/actions/connections/FinancialForce';
import * as API from '@libs/API';
import type {ApiRequestCommandParameters} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(),
    },
}));

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';

describe('actions/connections/FinancialForce', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateFinancialForceFxExpenseAccount', () => {
        it('writes the UpdateFinancialForceFxExpenseAccount command with the selected account', () => {
            updateFinancialForceFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [command, parameters] = call;
            expect(command).toBe(WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_FX_EXPENSE_ACCOUNT);

            // Certinia settings go through updateManyPolicyConnectionConfigurations, which encodes the config
            // itself, so the account ID travels raw rather than JSON encoded the way the Xero and QBO ones do.
            const expectedParameters = {
                policyID: MOCK_POLICY_ID,
                settingValue: 'account-123',
            } satisfies ApiRequestCommandParameters[typeof WRITE_COMMANDS.UPDATE_FINANCIAL_FORCE_FX_EXPENSE_ACCOUNT];
            expect(parameters).toEqual(expectedParameters);
        });

        it('merges fxExpenseAccount optimistically onto the Certinia config', () => {
            updateFinancialForceFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [, , onyxData] = call;
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            expect(optimisticUpdate?.value).toEqual(
                expect.objectContaining({
                    connections: expect.objectContaining({
                        [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: expect.objectContaining({
                            config: expect.objectContaining({
                                [CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT]: 'account-123',
                                pendingFields: {[CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            }),
                        }),
                    }),
                }),
            );
        });

        it('reverts fxExpenseAccount to the old account on failure', () => {
            updateFinancialForceFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [, , onyxData] = call;
            const failureUpdate = onyxData?.failureData?.at(0);
            expect(failureUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            expect(failureUpdate?.value).toEqual(
                expect.objectContaining({
                    connections: expect.objectContaining({
                        [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: expect.objectContaining({
                            config: expect.objectContaining({
                                [CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT]: 'old-account',
                            }),
                        }),
                    }),
                }),
            );
        });

        it('clears fxExpenseAccount back to null on failure when no account was set before', () => {
            updateFinancialForceFxExpenseAccount(MOCK_POLICY_ID, 'account-123', null);

            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [, , onyxData] = call;

            expect(onyxData?.failureData?.at(0)?.value).toEqual(
                expect.objectContaining({
                    connections: expect.objectContaining({
                        [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: expect.objectContaining({
                            config: expect.objectContaining({
                                [CONST.CERTINIA_CONFIG.FX_EXPENSE_ACCOUNT]: null,
                            }),
                        }),
                    }),
                }),
            );
        });
    });
});
