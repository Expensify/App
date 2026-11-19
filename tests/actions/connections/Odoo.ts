import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {clearOdooErrorField, connectToOdoo, updateOdooSubsidiary} from '@src/libs/actions/connections/Odoo';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
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
const MOCK_ODOO_URL = 'https://acme.odoo.com';
const MOCK_API_KEY = 'api-key-1';

// Asymmetric matchers are typed `any`; bind them to `unknown` so they can be nested inside `toMatchObject` payloads without tripping `no-unsafe-assignment`.
const ANY_STRING: unknown = expect.any(String);
const ANY_VALUE: unknown = expect.anything();

/** Returns the `onyxData` argument (third param) passed to the first `API.write` call. */
function getFirstWriteOnyxData() {
    return writeSpy.mock.calls.at(0)?.[2];
}

describe('actions/connections/Odoo', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('connectToOdoo', () => {
        it('writes the connect command with the policyID, the Odoo URL and the API key', () => {
            // Given a policy that the admin wants to link to their Odoo database
            // When the connection is initiated
            connectToOdoo(MOCK_POLICY_ID, MOCK_ODOO_URL, MOCK_API_KEY);

            // Then the connect command carries the URL as well as the key, since an API key alone can't reach an Odoo database
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_POLICY_TO_ODOO, {policyID: MOCK_POLICY_ID, odooURL: MOCK_ODOO_URL, apiKey: MOCK_API_KEY}, expect.anything());
        });

        it('optimistically marks the connection sync as in progress and clears it when the request is rejected', () => {
            // Given a policy being linked to Odoo
            // When the connection is initiated
            connectToOdoo(MOCK_POLICY_ID, MOCK_ODOO_URL, MOCK_API_KEY);

            // Then the Accounting page shows the sync spinner right away, and a rejected URL or key doesn't leave it spinning
            const syncProgressKey = `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${MOCK_POLICY_ID}`;
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: syncProgressKey,
                        value: {
                            stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.ODOO_SYNC_CONNECTION,
                            connectionName: CONST.POLICY.CONNECTIONS.NAME.ODOO,
                            timestamp: ANY_STRING,
                        },
                    },
                ],
                failureData: [{onyxMethod: Onyx.METHOD.SET, key: syncProgressKey, value: null}],
            });
        });
    });

    describe('clearOdooErrorField', () => {
        it('clears the error stored for the given field without calling API.write', async () => {
            // Given a policy whose Odoo config has a stored error on the company field
            await Onyx.merge(POLICY_KEY, {
                connections: {
                    odoo: {
                        config: {errorFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: {someTimestamp: 'some error'}}},
                    },
                },
            });
            await waitForBatchedUpdates();

            // When the user dismisses that error
            clearOdooErrorField(MOCK_POLICY_ID, CONST.ODOO_CONFIG.SUBSIDIARY_ID);
            await waitForBatchedUpdates();

            // Then the error is removed locally and no API call is made, because dismissing an error is a client-only concern
            const policy = await getOnyxValue(POLICY_KEY);
            expect(policy?.connections?.odoo?.config?.errorFields?.[CONST.ODOO_CONFIG.SUBSIDIARY_ID]).toBeUndefined();
            expect(writeSpy).not.toHaveBeenCalled();
        });
    });

    describe('updateOdooSubsidiary', () => {
        it('writes the company command and optimistically updates the config', () => {
            // Given a policy whose Odoo company is being changed from an old value
            // When the company is updated to a new one
            updateOdooSubsidiary(MOCK_POLICY_ID, 'company-2', 'company-1');

            // Then the update command is sent so the backend records the new company and re-syncs its data
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_ODOO_SUBSIDIARY, {policyID: MOCK_POLICY_ID, subsidiaryID: 'company-2'}, expect.anything());

            // Then the new company shows right away with a pending indicator, and a failure restores the old company with an error
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                odoo: {
                                    config: {
                                        subsidiaryID: 'company-2',
                                        pendingFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                        errorFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: null},
                                    },
                                },
                            },
                        },
                    },
                ],
                successData: [{key: POLICY_KEY, value: {connections: {odoo: {config: {pendingFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: null}}}}}}],
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                odoo: {
                                    config: {
                                        subsidiaryID: 'company-1',
                                        pendingFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: null},
                                        errorFields: {[CONST.ODOO_CONFIG.SUBSIDIARY_ID]: ANY_VALUE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });
    });
});
