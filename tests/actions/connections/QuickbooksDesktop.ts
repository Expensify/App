import * as API from '@libs/API';
import type {ApiRequestCommandParameters} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {updateQuickbooksDesktopFxExpenseAccount, updateQuickbooksDesktopTravelBillingPayableAccount} from '@src/libs/actions/connections/QuickbooksDesktop';
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

describe('actions/connections/QuickbooksDesktop', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateQuickbooksDesktopTravelBillingPayableAccount', () => {
        it('writes the dedicated payable account command with the selected account', () => {
            updateQuickbooksDesktopTravelBillingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [command, parameters] = call;
            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_TRAVEL_BILLING_PAYABLE_ACCOUNT);

            const expectedParameters = {
                policyID: MOCK_POLICY_ID,
                settingValue: 'account-123',
                idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT),
            } satisfies ApiRequestCommandParameters[typeof WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_TRAVEL_BILLING_PAYABLE_ACCOUNT];
            expect(parameters).toEqual(expectedParameters);
        });

        it('merges the payable account optimistically onto the QBD export config', () => {
            updateQuickbooksDesktopTravelBillingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

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
                        quickbooksDesktop: expect.objectContaining({
                            config: expect.objectContaining({export: expect.objectContaining({travelInvoicingPayableAccountID: 'account-123'})}),
                        }),
                    }),
                }),
            );
        });
    });

    describe('updateQuickbooksDesktopFxExpenseAccount', () => {
        it('writes the UpdateQuickbooksDesktopFxExpenseAccount command with the account ID', () => {
            // Given a workspace with a different fee account saved
            // When a new account is picked
            updateQuickbooksDesktopFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            // Then the command carries the account the backend books the cost to
            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [command, parameters] = call;
            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_FX_EXPENSE_ACCOUNT);

            // Auth parses settingValue as JSON and 400s on anything else, so the ID goes over the wire quoted
            const expectedParameters = {
                policyID: MOCK_POLICY_ID,
                settingValue: JSON.stringify('account-123'),
                idempotencyKey: String(CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT),
            } satisfies ApiRequestCommandParameters[typeof WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_FX_EXPENSE_ACCOUNT];
            expect(parameters).toEqual(expectedParameters);
        });

        it('merges fxExpenseAccount optimistically onto the QBD config and reverts on failure', () => {
            // Given a workspace with a different fee account saved
            // When a new account is picked
            updateQuickbooksDesktopFxExpenseAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            // Then the row shows it straight away, and goes back to the old account if the write fails
            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }
            const [, , onyxData] = call;
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.value).toEqual(
                expect.objectContaining({
                    connections: expect.objectContaining({
                        quickbooksDesktop: expect.objectContaining({
                            config: expect.objectContaining({fxExpenseAccount: 'account-123'}),
                        }),
                    }),
                }),
            );

            const failureUpdate = onyxData?.failureData?.at(0);
            expect(failureUpdate?.value).toEqual(
                expect.objectContaining({
                    connections: expect.objectContaining({
                        quickbooksDesktop: expect.objectContaining({
                            config: expect.objectContaining({fxExpenseAccount: 'old-account'}),
                        }),
                    }),
                }),
            );
        });

        it('skips the API call when the account has not changed', () => {
            // Given a workspace with an account already saved
            // When the same account is picked again
            updateQuickbooksDesktopFxExpenseAccount(MOCK_POLICY_ID, 'old-account', 'old-account');

            // Then nothing is sent, since there is no change to save
            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('skips the API call when policyID is missing', () => {
            // Given a policy that has not loaded, so there is no ID to write against
            // When an account is picked
            updateQuickbooksDesktopFxExpenseAccount(undefined, 'account-123', 'old-account');

            // Then nothing is sent rather than a request the backend would reject
            expect(writeSpy).not.toHaveBeenCalled();
        });
    });
});
