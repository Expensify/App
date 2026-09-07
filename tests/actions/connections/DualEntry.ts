import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {
    clearDualEntryErrorField,
    connectToDualEntry,
    updateDualEntryCreditCardAccount,
    updateDualEntryDefaultVendor,
    updateDualEntryEnableNewCategories,
    updateDualEntryExportDate,
    updateDualEntryExporter,
    updateDualEntryFieldMapping,
    updateDualEntrySubsidiary,
    updateDualEntrySyncTaxRates,
} from '@src/libs/actions/connections/DualEntry';
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

// Asymmetric matchers are typed `any`; bind them to `unknown` so they can be nested inside `toMatchObject` payloads without tripping `no-unsafe-assignment`.
const ANY_STRING: unknown = expect.any(String);
const ANY_VALUE: unknown = expect.anything();

/** Returns the `onyxData` argument (third param) passed to the first `API.write` call. */
function getFirstWriteOnyxData() {
    return writeSpy.mock.calls.at(0)?.[2];
}

describe('actions/connections/DualEntry', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('connectToDualEntry', () => {
        it('writes the connect command with the policyID and API key', () => {
            // Given a policy that the admin wants to link to DualEntry using an integration API key

            // When the connection is initiated
            connectToDualEntry(MOCK_POLICY_ID, 'api-key-123');

            // Then the connect command is sent with the policyID and API key so the backend can authenticate and establish the connection
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_POLICY_TO_DUALENTRY, expect.objectContaining({policyID: MOCK_POLICY_ID, apiKey: 'api-key-123'}), expect.anything());
        });

        it('optimistically marks the connection sync as in progress', () => {
            // Given a policy being linked to DualEntry

            // When the connection is initiated
            connectToDualEntry(MOCK_POLICY_ID, 'api-key-123');

            // Then the sync progress is optimistically set so the UI can show the sync spinner immediately, before the server responds
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${MOCK_POLICY_ID}`,
                        value: {
                            stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.DUALENTRY_SYNC_CONNECTION,
                            connectionName: CONST.POLICY.CONNECTIONS.NAME.DUALENTRY,
                            timestamp: ANY_STRING,
                        },
                    },
                ],
            });
        });
    });

    describe('clearDualEntryErrorField', () => {
        it('clears the error stored for the given field without calling API.write', async () => {
            // Given a policy whose DualEntry config has a stored error on the exporter field
            await Onyx.merge(POLICY_KEY, {
                connections: {
                    dualEntry: {
                        config: {errorFields: {[CONST.DUALENTRY_CONFIG.EXPORTER]: {someTimestamp: 'some error'}}},
                    },
                },
            });
            await waitForBatchedUpdates();

            // When the user dismisses that error
            clearDualEntryErrorField(MOCK_POLICY_ID, CONST.DUALENTRY_CONFIG.EXPORTER);
            await waitForBatchedUpdates();

            // Then the error is removed locally and no API call is made, because dismissing an error is a client-only concern
            const policy = await getOnyxValue(POLICY_KEY);
            // Onyx.merge with a `null` value deletes the nested key, so the cleared error reads back as undefined.
            expect(policy?.connections?.dualEntry?.config?.errorFields?.[CONST.DUALENTRY_CONFIG.EXPORTER]).toBeUndefined();
            expect(writeSpy).not.toHaveBeenCalled();
        });
    });

    describe('updateDualEntrySubsidiary', () => {
        it('writes the subsidiary command and optimistically updates the config', () => {
            // Given a policy whose DualEntry subsidiary is being changed from an old value

            // When the subsidiary is updated to a new one
            updateDualEntrySubsidiary(MOCK_POLICY_ID, 'subsidiary-1', 'old-subsidiary');

            // Then the update command is sent so the backend records the new subsidiary
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_SUBSIDIARY,
                expect.objectContaining({policyID: MOCK_POLICY_ID, subsidiaryID: 'subsidiary-1'}),
                expect.anything(),
            );

            // Then the config is optimistically updated with a pending action so the new subsidiary and its pending indicator show immediately
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                dualEntry: {
                                    config: {
                                        [CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: 'subsidiary-1',
                                        pendingFields: {[CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                        errorFields: {[CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: null},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });

        it('clears the pending field on success', () => {
            // Given a policy whose subsidiary is being updated

            // When the update is requested
            updateDualEntrySubsidiary(MOCK_POLICY_ID, 'subsidiary-1', 'old-subsidiary');

            // Then the pending field is cleared on success so the pending indicator disappears once the server confirms
            expect(getFirstWriteOnyxData()).toMatchObject({
                successData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {pendingFields: {[CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: null}}}}}}],
            });
        });

        it('rolls back to the old subsidiary and sets an error on failure', () => {
            // Given a policy whose subsidiary is being updated from a known old value

            // When the update is requested
            updateDualEntrySubsidiary(MOCK_POLICY_ID, 'subsidiary-1', 'old-subsidiary');

            // Then on failure the subsidiary rolls back to the old value and an error is set, so the user knows the change did not stick
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                dualEntry: {
                                    config: {
                                        [CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: 'old-subsidiary',
                                        pendingFields: {[CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: null},
                                        errorFields: {[CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: ANY_VALUE},
                                    },
                                },
                            },
                        },
                    },
                ],
            });
        });
    });

    describe('updateDualEntryEnableNewCategories', () => {
        it('writes the enable-new-categories command and optimistically updates the config', () => {
            // Given a policy where the "enable new categories" setting is currently off

            // When the setting is turned on
            updateDualEntryEnableNewCategories(MOCK_POLICY_ID, true, false);

            // Then the command is sent and the config optimistically reflects the enabled setting so the toggle updates instantly
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_ENABLE_NEW_CATEGORIES,
                expect.objectContaining({policyID: MOCK_POLICY_ID, enabled: true}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {[CONST.DUALENTRY_CONFIG.ENABLE_NEW_CATEGORIES]: true}}}}}],
            });
        });
    });

    describe('updateDualEntrySyncTaxRates', () => {
        it('writes the sync-tax-rates command and optimistically updates the coding config', () => {
            // Given a policy where syncing tax rates is currently off

            // When tax-rate syncing is turned on
            updateDualEntrySyncTaxRates(MOCK_POLICY_ID, true, false);

            // Then the command is sent and the nested coding config optimistically reflects the enabled setting so the toggle updates instantly
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_DUALENTRY_SYNC_TAX_RATES, expect.objectContaining({policyID: MOCK_POLICY_ID, enabled: true}), expect.anything());
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {coding: {[CONST.DUALENTRY_CONFIG.SYNC_TAX_RATES]: true}}}}}}],
            });
        });
    });

    describe('updateDualEntryFieldMapping', () => {
        const FEEDBACK_KEY = `${CONST.DUALENTRY_CONFIG.FIELD_MAPPING_PREFIX}department` as const;

        it('writes the field-mapping command and optimistically updates the nested field mapping', () => {
            // Given a policy where the "department" field is currently mapped to none

            // When the department field is remapped to a tag
            updateDualEntryFieldMapping(MOCK_POLICY_ID, 'department', CONST.DUALENTRY_MAPPING_VALUE.TAG, CONST.DUALENTRY_MAPPING_VALUE.NONE);

            // Then the command is sent and the nested field mapping is optimistically updated under a prefixed pending key so only that row shows a pending indicator
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_FIELD_MAPPING,
                expect.objectContaining({policyID: MOCK_POLICY_ID, fieldID: 'department', mapping: CONST.DUALENTRY_MAPPING_VALUE.TAG}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [
                    {
                        key: POLICY_KEY,
                        value: {
                            connections: {
                                dualEntry: {
                                    config: {
                                        coding: {fieldMappings: {department: CONST.DUALENTRY_MAPPING_VALUE.TAG}},
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
            // Given a policy where the "department" field is currently mapped to none

            // When the department field is remapped to a tag
            updateDualEntryFieldMapping(MOCK_POLICY_ID, 'department', CONST.DUALENTRY_MAPPING_VALUE.TAG, CONST.DUALENTRY_MAPPING_VALUE.NONE);

            // Then on failure the mapping rolls back to the old value so the UI reflects that the change was not saved
            expect(getFirstWriteOnyxData()).toMatchObject({
                failureData: [
                    {
                        key: POLICY_KEY,
                        value: {connections: {dualEntry: {config: {coding: {fieldMappings: {department: CONST.DUALENTRY_MAPPING_VALUE.NONE}}, pendingFields: {[FEEDBACK_KEY]: null}}}}},
                    },
                ],
            });
        });
    });

    describe('updateDualEntryExporter', () => {
        it('writes the exporter command and optimistically updates the export config', () => {
            // Given a policy whose export is currently attributed to an old exporter email

            // When the exporter is changed to a new email
            updateDualEntryExporter(MOCK_POLICY_ID, 'new@example.com', 'old@example.com');

            // Then the command is sent and the export config optimistically shows the new exporter so the change appears instantly
            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_DUALENTRY_EXPORTER, expect.objectContaining({policyID: MOCK_POLICY_ID, email: 'new@example.com'}), expect.anything());
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {export: {[CONST.DUALENTRY_CONFIG.EXPORTER]: 'new@example.com'}}}}}}],
            });
        });
    });

    describe('updateDualEntryExportDate', () => {
        it('writes the export-date command and optimistically updates the export config', () => {
            // Given a policy whose export date is currently set to the report-exported date

            // When the export date preference is changed to the last-expense date
            updateDualEntryExportDate(MOCK_POLICY_ID, CONST.DUALENTRY_EXPORT_DATE.LAST_EXPENSE, CONST.DUALENTRY_EXPORT_DATE.REPORT_EXPORTED);

            // Then the command is sent and the export config optimistically shows the new date preference so the change appears instantly
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_EXPORT_DATE,
                expect.objectContaining({policyID: MOCK_POLICY_ID, value: CONST.DUALENTRY_EXPORT_DATE.LAST_EXPENSE}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {export: {[CONST.DUALENTRY_CONFIG.EXPORT_DATE]: CONST.DUALENTRY_EXPORT_DATE.LAST_EXPENSE}}}}}}],
            });
        });
    });

    describe('updateDualEntryDefaultVendor', () => {
        it('writes the default-vendor command and optimistically updates the export config', () => {
            // Given a policy whose export currently uses an old default vendor

            // When the default vendor is changed to a new one
            updateDualEntryDefaultVendor(MOCK_POLICY_ID, 'vendor-1', 'old-vendor');

            // Then the command is sent and the export config optimistically shows the new default vendor so the change appears instantly
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_DEFAULT_VENDOR,
                expect.objectContaining({policyID: MOCK_POLICY_ID, vendorID: 'vendor-1'}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {export: {[CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID]: 'vendor-1'}}}}}}],
            });
        });
    });

    describe('updateDualEntryCreditCardAccount', () => {
        it('writes the credit-card-account command and optimistically updates the export config', () => {
            // Given a policy whose export currently uses an old credit-card account

            // When the credit-card account is changed to a new one
            updateDualEntryCreditCardAccount(MOCK_POLICY_ID, 'account-1', 'old-account');

            // Then the command is sent and the export config optimistically shows the new credit-card account so the change appears instantly
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_CREDIT_CARD_ACCOUNT,
                expect.objectContaining({policyID: MOCK_POLICY_ID, creditCardAccountID: 'account-1'}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {export: {[CONST.DUALENTRY_CONFIG.CREDIT_CARD_ACCOUNT_ID]: 'account-1'}}}}}}],
            });
        });
    });
});
