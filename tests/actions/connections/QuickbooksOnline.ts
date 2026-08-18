import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import {
    updateQuickbooksOnlineFxExpenseAccount,
    updateQuickbooksOnlineSyncReimbursedReports,
    updateQuickbooksOnlineTravelBillingPayableAccount,
} from '@src/libs/actions/connections/QuickbooksOnline';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';

import type {NullishDeep, OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/ErrorUtils');

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';
const MOCK_ACCOUNT_ID = 'account-123';
const MOCK_OLD_ACCOUNT_ID = 'account-456';
const MOCK_ONYX_ERROR: Errors = {key: 'error'};

type QuickBooksConfigUpdate = Pick<
    Partial<NullishDeep<QBOConnectionConfig>>,
    'collectionAccountID' | 'reimbursementAccountID' | 'travelInvoicingPayableAccountID' | 'fxExpenseAccount' | 'pendingFields' | 'errorFields'
>;

function isQuickBooksConfigUpdate(value: unknown): value is QuickBooksConfigUpdate {
    if (!isRecord(value)) {
        return false;
    }

    return (
        (value.collectionAccountID === undefined || value.collectionAccountID === null || typeof value.collectionAccountID === 'string') &&
        (value.reimbursementAccountID === undefined || value.reimbursementAccountID === null || typeof value.reimbursementAccountID === 'string') &&
        (value.travelInvoicingPayableAccountID === undefined || value.travelInvoicingPayableAccountID === null || typeof value.travelInvoicingPayableAccountID === 'string') &&
        (value.fxExpenseAccount === undefined || value.fxExpenseAccount === null || typeof value.fxExpenseAccount === 'string') &&
        (value.pendingFields === undefined ||
            value.pendingFields === null ||
            (isRecord(value.pendingFields) &&
                Object.values(value.pendingFields).every((field) => field === null || Object.values(CONST.RED_BRICK_ROAD_PENDING_ACTION).some((action) => action === field)))) &&
        (value.errorFields === undefined ||
            value.errorFields === null ||
            (isRecord(value.errorFields) &&
                Object.values(value.errorFields).every(
                    (error) => error === undefined || error === null || (isRecord(error) && Object.values(error).every((message) => message === null || typeof message === 'string')),
                )))
    );
}

function getQuickBooksConfig<TKey extends OnyxKey>(update?: OnyxUpdate<TKey>): QuickBooksConfigUpdate | undefined {
    const value: unknown = update?.value;
    if (!isRecord(value) || !isRecord(value.connections)) {
        return undefined;
    }

    const connection = value.connections[CONST.POLICY.CONNECTIONS.NAME.QBO];
    if (!isRecord(connection) || !('config' in connection) || !isQuickBooksConfigUpdate(connection.config)) {
        return undefined;
    }

    return connection.config;
}

function getRequiredQuickBooksConfig<TKey extends OnyxKey>(update?: OnyxUpdate<TKey>): QuickBooksConfigUpdate {
    const config = getQuickBooksConfig(update);
    if (!config) {
        throw new Error('QuickBooks config is missing from the provided Onyx update');
    }
    return config;
}

function getFirstWriteCall() {
    const call = writeSpy.mock.calls.at(0);
    if (!call) {
        throw new Error('API.write was not called');
    }
    const [command, params, onyxData] = call;
    return {command, params, onyxData};
}

describe('actions/connections/QuickbooksOnline', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(getMicroSecondOnyxErrorWithTranslationKey).mockReturnValue(MOCK_ONYX_ERROR);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateQuickbooksOnlineSyncReimbursedReports', () => {
        beforeEach(() => {
            writeSpy.mockClear();
        });

        it('writes the expected command', () => {
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_REIMBURSED_REPORTS);
        });

        it('updates both account IDs with the optimistic value', () => {
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(optimisticUpdate);

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });

        it('reverts to individual old values in failure data', () => {
            const collectionOld = 'collection-old';
            const reimbursementOld = 'reimbursement-old';
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, collectionOld, reimbursementOld);

            const {onyxData} = getFirstWriteCall();
            const failureUpdate = onyxData?.failureData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(failureUpdate);

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(collectionOld);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(reimbursementOld);
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ONYX_ERROR);
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ONYX_ERROR);
        });

        it('clears pending fields on success', () => {
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {onyxData} = getFirstWriteCall();
            const successUpdate = onyxData?.successData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(successUpdate);

            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });

        it('uses MERGE operations for each update stage', () => {
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {onyxData} = getFirstWriteCall();
            const updateGroups = [onyxData?.optimisticData, onyxData?.failureData, onyxData?.successData];
            for (const group of updateGroups) {
                if (!group) {
                    continue;
                }
                for (const update of group) {
                    expect(update.onyxMethod).toBe(Onyx.METHOD.MERGE);
                    expect(update.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);
                }
            }
        });

        it('skips the API call when the value already matches both old values', () => {
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('skips the API call when policyID is missing', () => {
            updateQuickbooksOnlineSyncReimbursedReports(undefined, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('handles null setting values', () => {
            // @ts-expect-error -- null is intentionally exercised as invalid runtime input.
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, null, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(optimisticUpdate);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });
    });

    describe('updateQuickbooksOnlineTravelBillingPayableAccount', () => {
        beforeEach(() => {
            writeSpy.mockClear();
        });

        it('writes the UpdateQuickbooksOnlineTravelBillingPayableAccount command with the account ID', () => {
            updateQuickbooksOnlineTravelBillingPayableAccount(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {command, params} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_TRAVEL_BILLING_PAYABLE_ACCOUNT);

            expect(params).toEqual(
                expect.objectContaining({
                    policyID: MOCK_POLICY_ID,
                    settingValue: MOCK_ACCOUNT_ID,
                    idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT),
                }),
            );
        });

        it('updates travelInvoicingPayableAccountID optimistically and reverts to the old value on failure', () => {
            updateQuickbooksOnlineTravelBillingPayableAccount(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            const optimisticConfig = getRequiredQuickBooksConfig(optimisticUpdate);
            expect(optimisticConfig[CONST.QUICKBOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT]).toBe(MOCK_ACCOUNT_ID);
            expect(optimisticConfig.pendingFields?.[CONST.QUICKBOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            const failureUpdate = onyxData?.failureData?.at(0);
            const failureConfig = getRequiredQuickBooksConfig(failureUpdate);
            expect(failureConfig[CONST.QUICKBOOKS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT]).toBe(MOCK_OLD_ACCOUNT_ID);
        });
    });

    describe('updateQuickbooksOnlineFxExpenseAccount', () => {
        beforeEach(() => {
            writeSpy.mockClear();
        });

        it('writes the UpdateQuickbooksOnlineFxExpenseAccount command with the account ID', () => {
            updateQuickbooksOnlineFxExpenseAccount(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {command, params} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_FX_EXPENSE_ACCOUNT);

            // Auth parses settingValue as JSON and 400s on anything else, so the ID goes over the wire quoted
            expect(params).toEqual(
                expect.objectContaining({
                    policyID: MOCK_POLICY_ID,
                    settingValue: JSON.stringify(MOCK_ACCOUNT_ID),
                    idempotencyKey: String(CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT),
                }),
            );
        });

        it('updates fxExpenseAccount optimistically and reverts to the old value on failure', () => {
            updateQuickbooksOnlineFxExpenseAccount(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            const optimisticConfig = getRequiredQuickBooksConfig(optimisticUpdate);
            expect(optimisticConfig[CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT]).toBe(MOCK_ACCOUNT_ID);
            expect(optimisticConfig.pendingFields?.[CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            const failureUpdate = onyxData?.failureData?.at(0);
            const failureConfig = getRequiredQuickBooksConfig(failureUpdate);
            expect(failureConfig[CONST.QUICKBOOKS_CONFIG.FX_EXPENSE_ACCOUNT]).toBe(MOCK_OLD_ACCOUNT_ID);
        });

        it('skips the API call when the account has not changed', () => {
            updateQuickbooksOnlineFxExpenseAccount(MOCK_POLICY_ID, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('skips the API call when policyID is missing', () => {
            updateQuickbooksOnlineFxExpenseAccount(undefined, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).not.toHaveBeenCalled();
        });
    });
});
