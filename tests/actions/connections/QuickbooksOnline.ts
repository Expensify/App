import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-syntax
import * as API from '@libs/API';
// eslint-disable-next-line no-restricted-syntax
import * as ErrorUtils from '@libs/ErrorUtils';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as QuickbooksOnline from '@src/libs/actions/connections/QuickbooksOnline';
import type {OnyxData} from '@src/types/onyx/Request';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('@libs/ErrorUtils');

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
        it('should update both COLLECTION_ACCOUNT_ID and REIMBURSEMENT_ACCOUNT_ID with same value in optimistic data', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(apiWriteSpy).toHaveBeenCalled();
            const [command, params, onyxData] = apiWriteSpy.mock.calls[0] as [string, any, OnyxData];

            expect(command).toBe(WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID);
            expect(params.policyID).toBe(MOCK_POLICY_ID);
            expect(params.settingValue).toBe(JSON.stringify(MOCK_ACCOUNT_ID));

            const {optimisticData} = onyxData;
            expect(optimisticData).toHaveLength(1);
            const configUpdate = (optimisticData![0].value as any).connections[CONST.POLICY.CONNECTIONS.NAME.QBO].config;

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);

            expect(configUpdate.pendingFields[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(configUpdate.pendingFields[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

            expect(configUpdate.errorFields[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            apiWriteSpy.mockRestore();
        });

        it('should update both COLLECTION_ACCOUNT_ID and REIMBURSEMENT_ACCOUNT_ID with old value in failure data', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(apiWriteSpy).toHaveBeenCalled();
            const [, , onyxData] = apiWriteSpy.mock.calls[0] as [string, any, OnyxData];

            const {failureData} = onyxData;
            expect(failureData).toHaveLength(1);
            const configUpdate = (failureData![0].value as any).connections[CONST.POLICY.CONNECTIONS.NAME.QBO].config;

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_OLD_ACCOUNT_ID);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_OLD_ACCOUNT_ID);

            expect(configUpdate.pendingFields[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.pendingFields[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            expect(configUpdate.errorFields[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ONYX_ERROR);
            expect(configUpdate.errorFields[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ONYX_ERROR);

            apiWriteSpy.mockRestore();
        });

        it('should update both COLLECTION_ACCOUNT_ID and REIMBURSEMENT_ACCOUNT_ID with new value in success data', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(apiWriteSpy).toHaveBeenCalled();
            const [, , onyxData] = apiWriteSpy.mock.calls[0] as [string, any, OnyxData];

            const {successData} = onyxData;
            expect(successData).toHaveLength(1);
            const configUpdate = (successData![0].value as any).connections[CONST.POLICY.CONNECTIONS.NAME.QBO].config;

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBe(MOCK_ACCOUNT_ID);

            expect(configUpdate.pendingFields[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.pendingFields[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            expect(configUpdate.errorFields[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate.errorFields[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            apiWriteSpy.mockRestore();
        });

        it('should have correct merge operation in all Onyx updates', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(apiWriteSpy).toHaveBeenCalled();
            const [, , onyxData] = apiWriteSpy.mock.calls[0] as [string, any, OnyxData];

            const {optimisticData, failureData, successData} = onyxData;

            [optimisticData!, failureData!, successData!].forEach((dataArray) => {
                dataArray.forEach((update: OnyxUpdate) => {
                    expect(update.onyxMethod).toBe(Onyx.METHOD.MERGE);
                    expect(update.key).toBe(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`);
                });
            });

            apiWriteSpy.mockRestore();
        });

        it('should not make API call when settingValue equals oldSettingValue', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, MOCK_ACCOUNT_ID);

            expect(apiWriteSpy).not.toHaveBeenCalled();

            apiWriteSpy.mockRestore();
        });

        it('should not make API call when policyID is undefined', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(undefined, MOCK_ACCOUNT_ID, MOCK_OLD_ACCOUNT_ID);

            expect(apiWriteSpy).not.toHaveBeenCalled();

            apiWriteSpy.mockRestore();
        });

        it('should handle null settingValue correctly', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, null as any, MOCK_OLD_ACCOUNT_ID);

            expect(apiWriteSpy).toHaveBeenCalled();
            const [, , onyxData] = apiWriteSpy.mock.calls[0] as [string, any, OnyxData];

            const {optimisticData} = onyxData;
            const configUpdate = (optimisticData![0].value as any).connections[CONST.POLICY.CONNECTIONS.NAME.QBO].config;

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            apiWriteSpy.mockRestore();
        });

        it('should handle undefined oldSettingValue correctly', () => {
            const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

            QuickbooksOnline.updateQuickbooksOnlineCollectionAccountID(MOCK_POLICY_ID, MOCK_ACCOUNT_ID, undefined);

            expect(apiWriteSpy).toHaveBeenCalled();
            const [, , onyxData] = apiWriteSpy.mock.calls[0] as [string, any, OnyxData];

            const {failureData} = onyxData;
            const configUpdate = (failureData![0].value as any).connections[CONST.POLICY.CONNECTIONS.NAME.QBO].config;

            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID]).toBeNull();
            expect(configUpdate[CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID]).toBeNull();

            apiWriteSpy.mockRestore();
        });
    });
});
