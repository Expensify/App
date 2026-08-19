import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {
    clearDualEntryErrorField,
    connectToDualEntry,
    updateDualEntryCreditCardAccount,
    updateDualEntryDefaultVendor,
    updateDualEntryEnableNewCategories,
    updateDualEntryExpensifyCardAccount,
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
            connectToDualEntry(MOCK_POLICY_ID, 'api-key-123');

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_POLICY_TO_DUALENTRY, expect.objectContaining({policyID: MOCK_POLICY_ID, apiKey: 'api-key-123'}), expect.anything());
        });

        it('optimistically marks the connection sync as in progress', () => {
            connectToDualEntry(MOCK_POLICY_ID, 'api-key-123');

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
            await Onyx.merge(POLICY_KEY, {
                connections: {
                    dualEntry: {
                        config: {errorFields: {[CONST.DUALENTRY_CONFIG.EXPORTER]: {someTimestamp: 'some error'}}},
                    },
                },
            });
            await waitForBatchedUpdates();

            clearDualEntryErrorField(MOCK_POLICY_ID, CONST.DUALENTRY_CONFIG.EXPORTER);
            await waitForBatchedUpdates();

            const policy = await getOnyxValue(POLICY_KEY);
            // Onyx.merge with a `null` value deletes the nested key, so the cleared error reads back as undefined.
            expect(policy?.connections?.dualEntry?.config?.errorFields?.[CONST.DUALENTRY_CONFIG.EXPORTER]).toBeUndefined();
            expect(writeSpy).not.toHaveBeenCalled();
        });
    });

    describe('updateDualEntrySubsidiary', () => {
        it('writes the subsidiary command and optimistically updates the config', () => {
            updateDualEntrySubsidiary(MOCK_POLICY_ID, 'subsidiary-1', 'old-subsidiary');

            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_SUBSIDIARY,
                expect.objectContaining({policyID: MOCK_POLICY_ID, subsidiaryID: 'subsidiary-1'}),
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
            updateDualEntrySubsidiary(MOCK_POLICY_ID, 'subsidiary-1', 'old-subsidiary');

            expect(getFirstWriteOnyxData()).toMatchObject({
                successData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {pendingFields: {[CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID]: null}}}}}}],
            });
        });

        it('rolls back to the old subsidiary and sets an error on failure', () => {
            updateDualEntrySubsidiary(MOCK_POLICY_ID, 'subsidiary-1', 'old-subsidiary');

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
            updateDualEntryEnableNewCategories(MOCK_POLICY_ID, true, false);

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
            updateDualEntrySyncTaxRates(MOCK_POLICY_ID, true, false);

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_DUALENTRY_SYNC_TAX_RATES, expect.objectContaining({policyID: MOCK_POLICY_ID, enabled: true}), expect.anything());
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {coding: {[CONST.DUALENTRY_CONFIG.SYNC_TAX_RATES]: true}}}}}}],
            });
        });
    });

    describe('updateDualEntryFieldMapping', () => {
        const FEEDBACK_KEY = `${CONST.DUALENTRY_CONFIG.FIELD_MAPPING_PREFIX}department` as const;

        it('writes the field-mapping command and optimistically updates the nested field mapping', () => {
            updateDualEntryFieldMapping(MOCK_POLICY_ID, 'department', CONST.DUALENTRY_MAPPING_VALUE.TAG, CONST.DUALENTRY_MAPPING_VALUE.NONE);

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
            updateDualEntryFieldMapping(MOCK_POLICY_ID, 'department', CONST.DUALENTRY_MAPPING_VALUE.TAG, CONST.DUALENTRY_MAPPING_VALUE.NONE);

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
            updateDualEntryExporter(MOCK_POLICY_ID, 'new@example.com', 'old@example.com');

            expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_DUALENTRY_EXPORTER, expect.objectContaining({policyID: MOCK_POLICY_ID, email: 'new@example.com'}), expect.anything());
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {export: {[CONST.DUALENTRY_CONFIG.EXPORTER]: 'new@example.com'}}}}}}],
            });
        });
    });

    describe('updateDualEntryExportDate', () => {
        it('writes the export-date command and optimistically updates the export config', () => {
            updateDualEntryExportDate(MOCK_POLICY_ID, CONST.DUALENTRY_EXPORT_DATE.LAST_EXPENSE, CONST.DUALENTRY_EXPORT_DATE.REPORT_EXPORTED);

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
            updateDualEntryDefaultVendor(MOCK_POLICY_ID, 'vendor-1', 'old-vendor');

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
            updateDualEntryCreditCardAccount(MOCK_POLICY_ID, 'account-1', 'old-account');

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

    describe('updateDualEntryExpensifyCardAccount', () => {
        it('writes the Expensify Card account command, mapping the value to the creditCardAccountID param', () => {
            updateDualEntryExpensifyCardAccount(MOCK_POLICY_ID, 'account-1', 'old-account');

            // The action sends the selected Expensify Card account under the `creditCardAccountID` param key.
            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_EXPENSIFY_CARD_ACCOUNT,
                expect.objectContaining({policyID: MOCK_POLICY_ID, creditCardAccountID: 'account-1'}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {export: {[CONST.DUALENTRY_CONFIG.EXPENSIFY_CARD_ACCOUNT_ID]: 'account-1'}}}}}}],
            });
        });

        it('optimistically stores an empty string when the custom override is cleared', () => {
            updateDualEntryExpensifyCardAccount(MOCK_POLICY_ID, '', 'account-1');

            expect(writeSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.UPDATE_DUALENTRY_EXPENSIFY_CARD_ACCOUNT,
                expect.objectContaining({policyID: MOCK_POLICY_ID, creditCardAccountID: ''}),
                expect.anything(),
            );
            expect(getFirstWriteOnyxData()).toMatchObject({
                optimisticData: [{key: POLICY_KEY, value: {connections: {dualEntry: {config: {export: {[CONST.DUALENTRY_CONFIG.EXPENSIFY_CARD_ACCOUNT_ID]: ''}}}}}}],
            });
        });
    });
});
