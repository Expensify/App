import {updateXeroFxExpenseAccount, updateXeroTravelBillingPayableAccount} from '@libs/actions/connections/Xero';
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

describe('actions/connections/Xero', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateXeroTravelBillingPayableAccount', () => {
        it('writes the UpdateXeroTravelBillingPayableAccount command with travelInvoicingPayableAccountID', () => {
            updateXeroTravelBillingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [command, parameters] = call;
            expect(command).toBe(WRITE_COMMANDS.UPDATE_XERO_TRAVEL_BILLING_PAYABLE_ACCOUNT);

            const expectedParameters = {
                policyID: MOCK_POLICY_ID,
                settingValue: 'account-123',
                idempotencyKey: CONST.XERO_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT,
            } satisfies ApiRequestCommandParameters[typeof WRITE_COMMANDS.UPDATE_XERO_TRAVEL_BILLING_PAYABLE_ACCOUNT];
            expect(parameters).toEqual(expectedParameters);
        });

        it('merges travelInvoicingPayableAccountID optimistically onto the Xero config', () => {
            updateXeroTravelBillingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

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
                        xero: expect.objectContaining({
                            config: expect.objectContaining({
                                export: expect.objectContaining({[CONST.XERO_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT]: 'account-123'}),
                                pendingFields: {[CONST.XERO_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            }),
                        }),
                    }),
                }),
            );
        });
    });

    describe('updateXeroFxExpenseAccount', () => {
        it('writes the UpdateXeroFxExpenseAccount command with the selected account', () => {
            updateXeroFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [command, parameters] = call;
            expect(command).toBe(WRITE_COMMANDS.UPDATE_XERO_FX_EXPENSE_ACCOUNT);

            const expectedParameters = {
                policyID: MOCK_POLICY_ID,
                settingValue: JSON.stringify('account-123'),
                idempotencyKey: CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT,
            } satisfies ApiRequestCommandParameters[typeof WRITE_COMMANDS.UPDATE_XERO_FX_EXPENSE_ACCOUNT];
            expect(parameters).toEqual(expectedParameters);
        });

        it('merges fxExpenseAccount optimistically onto the Xero config', () => {
            updateXeroFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

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
                        xero: expect.objectContaining({
                            config: expect.objectContaining({
                                [CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT]: 'account-123',
                                pendingFields: {[CONST.XERO_CONFIG.FX_EXPENSE_ACCOUNT]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            }),
                        }),
                    }),
                }),
            );
        });

        it('does not write when the account did not change', () => {
            updateXeroFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'account-123');

            expect(writeSpy).not.toHaveBeenCalled();
        });
    });
});
