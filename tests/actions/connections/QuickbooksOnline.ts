import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import * as QuickbooksOnline from '@src/libs/actions/connections/QuickbooksOnline';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType} from '@src/types/onyx';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';
import type {OnyxData} from '@src/types/onyx/Request';
import type { WriteCommand} from '@libs/API/types';
import { WRITE_COMMANDS } from '@libs/API/types';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/ErrorUtils');

const writeSpy = jest.spyOn(API, 'write');

const MOCK_POLICY_ID = 'MOCK_POLICY_ID';
const MOCK_ACCOUNT_ID = 'account-123';
const MOCK_OLD_ACCOUNT_ID = 'account-456';
const MOCK_ONYX_ERROR = {key: 'error'};

describe('actions/connections/QuickbooksOnline', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey as jest.Mock).mockReturnValue(MOCK_ONYX_ERROR);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateQuickbooksOnlineCollectionAccountID', () => {

        beforeEach(() => {
            jest.clearAllMocks();
            writeSpy.mockClear();
        });

        afterEach(() => {
            writeSpy.mockRestore();
        });

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

        function getFirstWriteCall(): {command: WriteCommand, onyxData: OnyxData} {
            const call = writeSpy.mock.calls.at(0);
            if (!call) {
                throw new Error('API.write was not called');
            }

            const [command, , onyxData] = call;
            if (!onyxData) {
                throw new Error('Expected Onyx data to be included in the API write call');
            }

            return {command, onyxData};
        }

        it('should update both COLLECTION_ACCOUNT_ID and REIMBURSEMENT_ACCOUNT_ID with same value in optimistic data', () => {
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).toHaveBeenCalled();
            const {command, onyxData} = getFirstWriteCall();

            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID);

            const optimisticUpdate = onyxData.optimisticData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(optimisticUpdate);

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);

            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });

        it('should update both COLLECTION_ACCOUNT_ID and REIMBURSEMENT_ACCOUNT_ID with old value in failure data', () => {
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).toHaveBeenCalled();
            const {onyxData} = getFirstWriteCall();

            const failureUpdate = onyxData.failureData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(failureUpdate);

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_OLD_ACCOUNT_ID);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_OLD_ACCOUNT_ID);

            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ONYX_ERROR);
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ONYX_ERROR);
        });

        it('should update both COLLECTION_ACCOUNT_ID and REIMBURSEMENT_ACCOUNT_ID with new value in success data', () => {
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).toHaveBeenCalled();
            const {onyxData} = getFirstWriteCall();

            const successUpdate = onyxData.successData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(successUpdate);

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);

            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.pendingFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields?.[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });

        it('should have correct merge operation in all Onyx updates', () => {
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).toHaveBeenCalled();
            const {onyxData} = getFirstWriteCall();
            const updateGroups = [onyxData.optimisticData, onyxData.failureData, onyxData.successData];

            for (const dataArray of updateGroups) {
                if (!dataArray) {
                    continue;
                }
                for (const update of dataArray) {
                    expect(update.onyxMethod).toBe(Onyx.METHOD.MERGE);
                    expect(update.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);
                }
            }
        });

        it('should not make API call when settingValue equals oldSettingValue', () => {
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_ACCOUNT_ID);

            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('should not make API call when policyID is undefined', () => {
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(undefined, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).not.toHaveBeenCalled();
        });

        it('should handle null settingValue correctly', () => {
            const nullSettingValue = null as unknown as QBOConnectionConfig[Extract<typeof CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID, keyof QBOConnectionConfig>];
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, nullSettingValue, MOCK_OLD_ACCOUNT_ID);

            expect(writeSpy).toHaveBeenCalled();
            const {onyxData} = getFirstWriteCall();

            const optimisticUpdate = onyxData.optimisticData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(optimisticUpdate);

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });

        it('should handle undefined oldSettingValue correctly', () => {
            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, undefined);

            expect(writeSpy).toHaveBeenCalled();
            const {onyxData} = getFirstWriteCall();

            const failureUpdate = onyxData.failureData?.at(0);
            const configUpdate = getRequiredQuickBooksConfig(failureUpdate);

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();
        });
    });
});
