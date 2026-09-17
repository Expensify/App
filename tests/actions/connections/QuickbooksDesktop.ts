import * as API from '@libs/API';
import type {ApiRequestCommandParameters} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {updateQuickbooksDesktopTravelBillingPayableAccount} from '@src/libs/actions/connections/QuickbooksDesktop';
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
});
