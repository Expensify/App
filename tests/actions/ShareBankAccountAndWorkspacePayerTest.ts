import Onyx from 'react-native-onyx';
import {shareBankAccountAndSetPayer} from '@libs/actions/BankAccounts';
import {setWorkspacePayer} from '@libs/actions/Policy/Policy';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    write: jest.fn(),
}));

describe('actions/ShareBankAccountAndWorkspacePayer', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('shareBankAccountAndSetPayer', () => {
        it('should call API.write with ShareBankAccountAndUpdatePolicyReimburser command and correct parameters', async () => {
            const bankAccountID = 123;
            const shareeAccountID = 456;
            const policyID = 'policy_789';

            shareBankAccountAndSetPayer(bankAccountID, shareeAccountID, policyID);
            await waitForBatchedUpdates();

            expect(write).toHaveBeenCalledWith(
                WRITE_COMMANDS.SHARE_BANK_ACCOUNT_AND_UPDATE_POLICY_REIMBURSER,
                {
                    bankAccountID,
                    shareeAccountID,
                    policyID,
                },
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.SHARE_BANK_ACCOUNT,
                            value: expect.objectContaining({
                                isLoading: true,
                                errors: null,
                            }),
                        }),
                    ]),
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.SHARE_BANK_ACCOUNT,
                            value: expect.objectContaining({
                                isLoading: false,
                                errors: null,
                                admins: null,
                                shouldShowSuccess: true,
                            }),
                        }),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.SHARE_BANK_ACCOUNT,
                            value: expect.objectContaining({
                                isLoading: false,
                            }),
                        }),
                    ]),
                }),
            );
        });
    });

    describe('setWorkspacePayer', () => {
        it('should call API.write with SetWorkspacePayer command and correct parameters', async () => {
            const policyID = 'policy_abc';
            const reimburserEmail = 'payer@example.com';

            setWorkspacePayer(policyID, reimburserEmail);
            await waitForBatchedUpdates();

            expect(write).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_WORKSPACE_PAYER,
                {
                    policyID,
                    reimburserEmail,
                },
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                            value: expect.objectContaining({
                                reimburser: reimburserEmail,
                                achAccount: {reimburser: reimburserEmail},
                                errorFields: {reimburser: null},
                                pendingFields: {reimburser: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            }),
                        }),
                    ]),
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                            value: expect.objectContaining({
                                errorFields: {reimburser: null},
                                pendingFields: {reimburser: null},
                            }),
                        }),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                            value: expect.objectContaining({
                                // Error object shape from ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey
                                errorFields: expect.objectContaining({
                                    reimburser: expect.anything(), // eslint-disable-line @typescript-eslint/no-unsafe-assignment -- Jest matcher
                                }),
                                pendingFields: {reimburser: null},
                            }),
                        }),
                    ]),
                }),
            );
        });
    });
});
