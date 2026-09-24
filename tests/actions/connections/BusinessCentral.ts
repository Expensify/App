import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {
    clearBusinessCentralErrorField,
    connectToBusinessCentral,
    updateBusinessCentralCompany,
    updateBusinessCentralEnableNewCategories,
    updateBusinessCentralFieldMapping,
    updateBusinessCentralSyncItems,
    updateBusinessCentralSyncTaxRates,
} from '@src/libs/actions/connections/BusinessCentral';
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
const MOCK_CREDENTIALS = {
    tenantID: 'tenant-1',
    environmentName: 'Production',
    clientID: 'client-1',
    clientSecret: 'secret-1',
};

// Asymmetric matchers are typed `any`; bind them to `unknown` so they can be nested inside `toMatchObject` payloads without tripping `no-unsafe-assignment`.
const ANY_STRING: unknown = expect.any(String);
const ANY_VALUE: unknown = expect.anything();

/** Returns the `onyxData` argument (third param) passed to the first `API.write` call. */
function getFirstWriteOnyxData() {
    return writeSpy.mock.calls.at(0)?.[2];
}

describe('actions/connections/BusinessCentral', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('connectToBusinessCentral', () => {
        it('writes the connect command with the policyID and every credential', () => {
            // Given a policy that the admin wants to link to Business Central with an app registration
            // When the connection is initiated
            connectToBusinessCentral(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            // Then the connect command carries the policyID and all four credentials so the backend can request a token and list companies
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.CONNECT_POLICY_TO_BUSINESS_CENTRAL,
                expect.objectContaining({policyID: MOCK_POLICY_ID, ...MOCK_CREDENTIALS}),
                expect.anything(),
            );
        });

        it('optimistically marks the connection sync as in progress', () => {
            // Given a policy being linked to Business Central
            // When the connection is initiated
            connectToBusinessCentral(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            // Then the sync progress is set optimistically so the Accounting page shows the spinner before the sync job reports back
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${MOCK_POLICY_ID}`,
                        value: {
                            stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.BUSINESS_CENTRAL_SYNC_CONNECTION,
                            connectionName: CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL,
                            timestamp: ANY_STRING,
                        },
                    },
                ],
            });
        });

        it('clears the sync progress when the request is rejected', () => {
            // Given a policy being linked to Business Central
            // When the connection is initiated
            connectToBusinessCentral(MOCK_POLICY_ID, MOCK_CREDENTIALS);

            // Then a rejected request clears the optimistic sync progress, otherwise the Accounting page would keep showing the spinner
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${MOCK_POLICY_ID}`,
                        value: null,
                    },
                ],
            });
        });
    });

    describe('clearBusinessCentralErrorField', () => {
        it('clears the error stored for the given field without calling API.write', async () => {
            // Given a policy whose Business Central config has a stored error on the company field
            await Onyx.merge(POLICY_KEY, {
                connections: {
                    businessCentral: {
                        config: {errorFields: {[CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: {someTimestamp: 'some error'}}},
                    },
                },
            });
            await waitForBatchedUpdates();

            // When the user dismisses that error
            clearBusinessCentralErrorField(MOCK_POLICY_ID, CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID);
            await waitForBatchedUpdates();

            // Then the error is removed locally and no API call is made, because dismissing an error is a client-only concern
            const policy = await getOnyxValue(POLICY_KEY);
            // Onyx.merge with a `null` value deletes the nested key, so the cleared error reads back as undefined.
            expect(policy?.connections?.businessCentral?.config?.errorFields?.[CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]).toBeUndefined();
            expect(writeSpy).not.toHaveBeenCalled();
        });
    });

    describe('updateBusinessCentralCompany', () => {
        it('writes the company command and optimistically updates the config', () => {
            // Given a policy whose Business Central company is being changed from an old value
            // When the company is updated to a new one
            updateBusinessCentralCompany(MOCK_POLICY_ID, 'company-1', 'old-company');

            // Then the update command is sent so the backend records the new company and re-syncs its data
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_COMPANY,
                expect.objectContaining({policyID: MOCK_POLICY_ID, companyID: 'company-1'}),
                expect.anything(),
            );

            // Then the config is optimistically updated with a pending action so the new company and its pending indicator show immediately
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: 'company-1',
                                        pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                        errorFields: {[CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });

        it('clears the pending field on success', () => {
            // Given a policy whose company is being updated
            // When the update is requested
            updateBusinessCentralCompany(MOCK_POLICY_ID, 'company-1', 'old-company');

            // Then the pending field is cleared on success so the pending indicator disappears once the server confirms
            expect(getFirstWriteOnyxData()).toMatchObject({
                successData: [{key: POLICY_KEY, value: {connections: {businessCentral: {config: {pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null}}}}}}],
            });
        });

        it('rolls back to the old company and sets an error on failure', () => {
            // Given a policy whose company is being updated from a known old value
            // When the update is requested
            updateBusinessCentralCompany(MOCK_POLICY_ID, 'company-1', 'old-company');

            // Then on failure the company rolls back to the old value and an error is set, so the user knows the change did not stick
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        [CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: 'old-company',
                                        pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: null},
                                        errorFields: {[CONST.BUSINESS_CENTRAL_CONFIG.COMPANY_ID]: ANY_VALUE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });
    });

    describe('updateBusinessCentralEnableNewCategories', () => {
        it('writes the enable-new-categories command and optimistically updates the config', () => {
            // Given a policy whose newly imported categories are currently disabled
            // When the setting is turned on
            updateBusinessCentralEnableNewCategories(MOCK_POLICY_ID, true, false);

            // Then the command is sent and the config optimistically reflects the enabled setting so the toggle updates instantly
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_ENABLE_NEW_CATEGORIES,
                expect.objectContaining({policyID: MOCK_POLICY_ID, enabled: true}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: true,
                                        pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });

        it('rolls back to the old value and sets an error on failure', () => {
            // Given a policy whose newly imported categories are currently disabled
            // When the setting is turned on
            updateBusinessCentralEnableNewCategories(MOCK_POLICY_ID, true, false);

            // Then on failure the setting rolls back and an error is set, so the user knows the change did not stick
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        [CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: false,
                                        pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: null},
                                        errorFields: {[CONST.BUSINESS_CENTRAL_CONFIG.ENABLE_NEW_CATEGORIES]: ANY_VALUE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });
    });

    describe('updateBusinessCentralSyncTaxRates', () => {
        it('writes the sync-tax-rates command and optimistically updates the coding config', () => {
            // Given a policy where syncing tax rates is currently off
            // When tax-rate syncing is turned on
            updateBusinessCentralSyncTaxRates(MOCK_POLICY_ID, true, false);

            // Then the command is sent and the nested coding config optimistically reflects the enabled setting so the toggle updates instantly
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_SYNC_TAX_RATES,
                expect.objectContaining({policyID: MOCK_POLICY_ID, enabled: true}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        coding: {[CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES]: true},
                                        pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });

        it('rolls the coding config back to the old value on failure', () => {
            // Given a policy where syncing tax rates is currently off
            // When tax-rate syncing is turned on
            updateBusinessCentralSyncTaxRates(MOCK_POLICY_ID, true, false);

            // Then on failure the nested setting rolls back so the toggle reflects that the change was not saved
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        coding: {[CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES]: false},
                                        pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES]: null},
                                        errorFields: {[CONST.BUSINESS_CENTRAL_CONFIG.SYNC_TAX_RATES]: ANY_VALUE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });
    });

    describe('updateBusinessCentralSyncItems', () => {
        it('writes the sync-items command and optimistically updates the coding config', () => {
            // Given a policy where importing items is currently off
            // When item import is turned on
            updateBusinessCentralSyncItems(MOCK_POLICY_ID, true, false);

            // Then the command is sent and the nested coding config optimistically reflects the enabled setting so the toggle updates instantly
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_SYNC_ITEMS, expect.objectContaining({policyID: MOCK_POLICY_ID, enabled: true}), expect.anything());
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        coding: {[CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS]: true},
                                        pendingFields: {[CONST.BUSINESS_CENTRAL_CONFIG.SYNC_ITEMS]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });
    });

    describe('updateBusinessCentralFieldMapping', () => {
        const DIMENSION_CODE = 'DEPARTMENT';
        const FEEDBACK_KEY = `${CONST.BUSINESS_CENTRAL_CONFIG.FIELD_MAPPING_PREFIX}${DIMENSION_CODE}` as const;

        it('writes the field-mapping command and optimistically updates the nested field mapping', () => {
            // Given a policy whose DEPARTMENT dimension is currently not imported
            // When the dimension is switched to import as a tag
            updateBusinessCentralFieldMapping(MOCK_POLICY_ID, DIMENSION_CODE, CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG, CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE);

            // Then the command carries the dimension code and the mapping is optimistically stored under a prefixed pending key so only that row shows a pending indicator
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_BUSINESS_CENTRAL_FIELD_MAPPING,
                expect.objectContaining({policyID: MOCK_POLICY_ID, dimensionCode: DIMENSION_CODE, mapping: CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        coding: {fieldMappings: {[DIMENSION_CODE]: CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG}},
                                        pendingFields: {[FEEDBACK_KEY]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });

        it('rolls the field mapping back to the old value on failure', () => {
            // Given a policy whose DEPARTMENT dimension is currently not imported
            // When the dimension is switched to import as a tag
            updateBusinessCentralFieldMapping(MOCK_POLICY_ID, DIMENSION_CODE, CONST.BUSINESS_CENTRAL_MAPPING_VALUE.TAG, CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE);

            // Then on failure the mapping rolls back to the old value so the row reflects that the change was not saved
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                businessCentral: {
                                    config: {
                                        coding: {fieldMappings: {[DIMENSION_CODE]: CONST.BUSINESS_CENTRAL_MAPPING_VALUE.NONE}},
                                        pendingFields: {[FEEDBACK_KEY]: null},
                                        errorFields: {[FEEDBACK_KEY]: ANY_VALUE},
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
