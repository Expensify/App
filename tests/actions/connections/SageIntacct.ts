import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {updateSageIntacctTravelInvoicingPayableAccount} from '@libs/actions/connections/SageIntacct';
import * as API from '@libs/API';
import type {WriteCommand} from '@libs/API/types';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType} from '@src/types/onyx';
import type {SageIntacctConnectionsConfig} from '@src/types/onyx/Policy';
import type {AnyOnyxData} from '@src/types/onyx/Request';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/ErrorUtils');

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';
const MOCK_ONYX_ERROR = {key: 'error'};

function getSageIntacctConfig<TKey extends OnyxKey>(update?: OnyxUpdate<TKey>): SageIntacctConnectionsConfig | undefined {
    if (!update || typeof update.value !== 'object' || update.value === null) {
        return undefined;
    }

    const policyData = update.value as Pick<PolicyType, 'connections'>;
    return policyData.connections?.intacct?.config;
}

function getRequiredSageIntacctConfig<TKey extends OnyxKey>(update?: OnyxUpdate<TKey>): SageIntacctConnectionsConfig {
    const config = getSageIntacctConfig(update);
    if (!config) {
        throw new Error('Sage Intacct config is missing from the provided Onyx update');
    }
    return config;
}

function getFirstWriteCall(): {command: WriteCommand; onyxData?: AnyOnyxData} {
    const call = writeSpy.mock.calls.at(0);
    if (!call) {
        throw new Error('API.write was not called');
    }
    const [command, , onyxData] = call;
    return {command, onyxData};
}

describe('actions/connections/SageIntacct', () => {
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

    describe('updateSageIntacctTravelInvoicingPayableAccount', () => {
        beforeEach(() => {
            writeSpy.mockClear();
        });

        it('writes the UpdateManyPolicyConnectionConfigs command with travelInvoicingPayableAccountID', () => {
            updateSageIntacctTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {command} = getFirstWriteCall();
            expect(command).toBe(WRITE_COMMANDS.UPDATE_MANY_POLICY_CONNECTION_CONFIGS);

            const call = writeSpy.mock.calls.at(0);
            const params = call?.[1] as {connectionName: string; configUpdate: string; idempotencyKey: string; policyID: string};
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.connectionName).toBe(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT);
            expect(params.idempotencyKey).toBe(CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT);
            expect(JSON.parse(params.configUpdate)).toEqual({[CONST.SAGE_INTACCT_CONFIG.EXPORT]: {[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]: 'account-123'}});
        });

        it('updates travelInvoicingPayableAccountID optimistically, sets pending field, and clears error field', () => {
            updateSageIntacctTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {onyxData} = getFirstWriteCall();
            const optimisticUpdate = onyxData?.optimisticData?.at(0);
            expect(optimisticUpdate?.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);

            const configUpdate = getRequiredSageIntacctConfig(optimisticUpdate);
            expect(configUpdate.export?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBe('account-123');
            expect(configUpdate.pendingFields?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(configUpdate.errorFields?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBeNull();
        });

        it('reverts to the old value and sets an error in failure data', () => {
            updateSageIntacctTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {onyxData} = getFirstWriteCall();
            const failureUpdate = onyxData?.failureData?.at(0);
            const configUpdate = getRequiredSageIntacctConfig(failureUpdate);

            expect(configUpdate.export?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBe('old-account');
            expect(configUpdate.pendingFields?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBe(MOCK_ONYX_ERROR);
        });

        it('clears pending and error fields on success', () => {
            updateSageIntacctTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

            const {onyxData} = getFirstWriteCall();
            const successUpdate = onyxData?.successData?.at(0);
            const configUpdate = getRequiredSageIntacctConfig(successUpdate);

            expect(configUpdate.pendingFields?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT]).toBeNull();
        });

        it('uses MERGE operations for each update stage', () => {
            updateSageIntacctTravelInvoicingPayableAccount(MOCK_POLICY_ID, 'account-123', 'old-account');

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
    });
});
