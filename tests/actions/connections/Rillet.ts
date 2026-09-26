import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {updateRilletFxExpenseAccount} from '@src/libs/actions/connections/Rillet';
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
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}` as const;

// Asymmetric matchers are typed `any`; bind them to `unknown` so they can be nested inside `toMatchObject` payloads without tripping `no-unsafe-assignment`.
const ANY_VALUE: unknown = expect.anything();

/** Returns the `onyxData` argument (third param) passed to the first `API.write` call. */
function getFirstWriteOnyxData() {
    return writeSpy.mock.calls.at(0)?.[2];
}

describe('actions/connections/Rillet', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateRilletFxExpenseAccount', () => {
        it('writes the command with the selected expense account code', () => {
            // Given an admin picking the account the company-paid currency conversion cost is booked to

            // When the account is saved
            updateRilletFxExpenseAccount(MOCK_POLICY_ID, '6100', '6000');

            // Then the backend receives the account code so the bill payment sync can post the cost to it
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_RILLET_FX_EXPENSE_ACCOUNT, {policyID: MOCK_POLICY_ID, fxExpenseAccountCode: '6100'}, expect.anything());
        });

        it('shows the new account optimistically and restores the previous one on failure', () => {
            // Given a workspace whose FX expense account was already set

            // When the admin picks a different account
            updateRilletFxExpenseAccount(MOCK_POLICY_ID, '6100', '6000');

            // Then the new account shows as pending right away, and a failed save puts the previous account back with an error
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                rillet: {
                                    config: {
                                        sync: {[CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE]: '6100'},
                                        pendingFields: {[CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                    },
                                },
                            },
                        },
                    },
                ],
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                rillet: {
                                    config: {
                                        sync: {[CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE]: '6000'},
                                        errorFields: {[CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE]: ANY_VALUE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });

        it('clears the setting on failure when no account was set before', () => {
            // Given a workspace that never had an FX expense account

            // When the first save fails
            updateRilletFxExpenseAccount(MOCK_POLICY_ID, '6100');

            // Then the failure clears the optimistic value instead of leaving an account that was never saved
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {connections: {rillet: {config: {sync: {[CONST.RILLET_CONFIG.FX_EXPENSE_ACCOUNT_CODE]: null}}}}},
                    },
                ],
            });
        });
    });
});
