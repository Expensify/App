import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-syntax -- this is required to allow mocking
import * as API from '@libs/API';
import type {WriteCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import {updateQuickbooksOnlineSyncReimbursedReports} from '@src/libs/actions/connections/QuickbooksOnline';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType} from '@src/types/onyx';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/ErrorUtils');

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';
const MOCK_ACCOUNT_ID = 'account-123';
const MOCK_OLD_ACCOUNT_ID = 'account-456';
const MOCK_ONYX_ERROR = {key: 'error'};

function getQuickBooksConfig(update?: OnyxUpdate): QBOConnectionConfig | undefined {
    if (!update || typeof update.value !== 'object' || update.value === null) {
        return undefined;
    }

    const policyData = update.value as Pick<PolicyType, 'connections'>;
    const connection = policyData.connections?.[CONST.POLICY.CONNECTIONS.NAME.QBO];
    return connection?.config;
}

function getRequiredQuickBooksConfig(update?: OnyxUpdate): QBOConnectionConfig {
    const config = getQuickBooksConfig(update);
    if (!config) {
        throw new Error('QuickBooks config is missing from the provided Onyx update');
    }
    return config;
}

function getFirstWriteCall(): {command: WriteCommand; onyxData?: OnyxData} {
    const call = writeSpy.mock.calls.at(0);
    if (!call) {
        throw new Error('API.write was not called');
    }
    const [command, , onyxData] = call;
    return {command, onyxData};
}

describe('actions/connections/QuickbooksOnline', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (getMicroSecondOnyxErrorWithTranslationKey as jest.Mock).mockReturnValue(MOCK_ONYX_ERROR);
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
            const nullSettingValue = null as unknown as QBOConnectionConfig[Extract<typeof CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID, keyof QBOConnectionConfig>];
            updateQuickbooksOnlineSyncReimbursedReports(MOCK_POLICY_ID, nullSettingValue, MOCK_OLD_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(optimisticUpdate);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });
    });
});
