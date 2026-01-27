/* eslint-disable no-restricted-syntax */
import Onyx from 'react-native-onyx';
import type {OnyxMergeInput} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import * as UserActions from '../../src/libs/actions/User';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
const mockAPI = API as jest.Mocked<typeof API>;

describe('actions/User', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('clearContactMethod', () => {
        it('should return early when contactMethods array is empty', async () => {
            // Given an empty array
            const contactMethods: string[] = [];

            // When clearContactMethod is called
            UserActions.clearContactMethod(contactMethods);
            await waitForBatchedUpdates();

            // Then LOGIN_LIST should remain unchanged (null/undefined)
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGIN_LIST,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList).toBeNull();
        });

        it('should clear a single contact method from LOGIN_LIST', async () => {
            // Given a login list with a contact method
            const contactMethod = 'test@example.com';
            const initialLoginList = {
                [contactMethod]: {
                    partnerUserID: contactMethod,
                    validatedDate: '2024-01-01',
                },
            };

            await Onyx.merge(ONYXKEYS.LOGIN_LIST, initialLoginList);
            await waitForBatchedUpdates();

            // When clearContactMethod is called with that contact method
            UserActions.clearContactMethod([contactMethod]);
            await waitForBatchedUpdates();

            // Then the contact method should be set to null in LOGIN_LIST
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGIN_LIST,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList).toEqual({});
        });

        it('should clear multiple contact methods from LOGIN_LIST', async () => {
            // Given a login list with multiple contact methods
            const contactMethod1 = 'test1@example.com';
            const contactMethod2 = 'test2@example.com';
            const contactMethod3 = 'test3@example.com';
            const initialLoginList = {
                [contactMethod1]: {
                    partnerUserID: contactMethod1,
                    validatedDate: '2024-01-01',
                },
                [contactMethod2]: {
                    partnerUserID: contactMethod2,
                    validatedDate: '2024-01-02',
                },
                [contactMethod3]: {
                    partnerUserID: contactMethod3,
                    validatedDate: '2024-01-03',
                },
            };

            await Onyx.merge(ONYXKEYS.LOGIN_LIST, initialLoginList);
            await waitForBatchedUpdates();

            // When clearContactMethod is called with multiple contact methods
            UserActions.clearContactMethod([contactMethod1, contactMethod3]);
            await waitForBatchedUpdates();

            // Then the specified contact methods should be set to null, while others remain unchanged
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGIN_LIST,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList).toEqual({
                [contactMethod2]: {
                    partnerUserID: contactMethod2,
                    validatedDate: '2024-01-02',
                },
            });
        });

        it('should handle clearing contact methods that do not exist in LOGIN_LIST', async () => {
            // Given a login list with some contact methods
            const existingContactMethod = 'existing@example.com';
            const nonExistentContactMethod = 'nonexistent@example.com';
            const initialLoginList = {
                [existingContactMethod]: {
                    partnerUserID: existingContactMethod,
                    validatedDate: '2024-01-01',
                },
            };

            await Onyx.merge(ONYXKEYS.LOGIN_LIST, initialLoginList);
            await waitForBatchedUpdates();

            // When clearContactMethod is called with both existing and non-existent contact methods
            UserActions.clearContactMethod([existingContactMethod, nonExistentContactMethod]);
            await waitForBatchedUpdates();

            // Then both should be set to null in LOGIN_LIST
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGIN_LIST,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList).toEqual({});
        });
    });

    describe('verifyAddSecondaryLoginCode', () => {
        it('should call API.write with correct parameters and reset validateCodeSent', async () => {
            // Given a validate code
            const validateCode = '123456';

            // Set initial state for VALIDATE_ACTION_CODE
            await Onyx.merge(ONYXKEYS.VALIDATE_ACTION_CODE, {
                validateCodeSent: true,
            });
            await waitForBatchedUpdates();

            // When verifyAddSecondaryLoginCode is called
            UserActions.verifyAddSecondaryLoginCode(validateCode);
            await waitForBatchedUpdates();

            // Then API.write should be called with correct parameters
            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.VERIFY_ADD_SECONDARY_LOGIN_CODE,
                {validateCode},
                expect.objectContaining({
                    optimisticData: expect.any(Array) as Array<{key: string; value: unknown}>,
                    successData: expect.any(Array) as Array<{key: string; value: unknown}>,
                    failureData: expect.any(Array) as Array<{key: string; value: unknown}>,
                }),
            );

            // Verify validateCodeSent is reset to false
            const validateActionCode = await new Promise<{validateCodeSent?: boolean} | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.VALIDATE_ACTION_CODE,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(validateActionCode?.validateCodeSent).toBe(false);
        });

        it('should apply optimisticData correctly', async () => {
            // Given a validate code
            const validateCode = '123456';

            // When verifyAddSecondaryLoginCode is called
            UserActions.verifyAddSecondaryLoginCode(validateCode);
            await waitForBatchedUpdates();

            // Then verify the optimisticData structure
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (mockAPI.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, {optimisticData?: Array<{key: string; value: unknown}>}];
            const optimisticData = onyxData.optimisticData ?? [];

            expect(optimisticData).toHaveLength(1);
            expect(optimisticData.at(0)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PENDING_CONTACT_ACTION,
                value: {
                    validateActionCode: validateCode,
                    isLoading: true,
                    errorFields: {
                        validateActionCode: null,
                    },
                },
            });
        });

        it('should have correct successData structure', async () => {
            // Given a validate code
            const validateCode = '123456';

            // When verifyAddSecondaryLoginCode is called
            UserActions.verifyAddSecondaryLoginCode(validateCode);
            await waitForBatchedUpdates();

            // Then verify the successData structure
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (mockAPI.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, {successData?: Array<{key: string; value: unknown}>}];
            const successData = onyxData.successData ?? [];

            expect(successData).toHaveLength(1);
            expect(successData.at(0)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PENDING_CONTACT_ACTION,
                value: {
                    isVerifiedValidateActionCode: true,
                    isLoading: false,
                },
            });
        });

        it('should have correct failureData structure', async () => {
            // Given a validate code
            const validateCode = '123456';

            // When verifyAddSecondaryLoginCode is called
            UserActions.verifyAddSecondaryLoginCode(validateCode);
            await waitForBatchedUpdates();

            // Then verify the failureData structure
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (mockAPI.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, {failureData?: Array<{key: string; value: unknown}>}];
            const failureData = onyxData.failureData ?? [];

            expect(failureData).toHaveLength(1);
            expect(failureData.at(0)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PENDING_CONTACT_ACTION,
                value: {
                    isVerifiedValidateActionCode: false,
                    isLoading: false,
                },
            });
        });

        it('should apply optimisticData to Onyx when API.write applies it', async () => {
            // Given a validate code and mock API.write that applies optimisticData
            const validateCode = '123456';

            // Mock API.write to apply optimisticData
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            (mockAPI.write as jest.Mock).mockImplementation(
                (
                    command: unknown,
                    params: unknown,
                    options?: {
                        optimisticData?: Array<{onyxMethod: typeof Onyx.METHOD.MERGE; key: string; value: unknown}>;
                    },
                ) => {
                    if (options?.optimisticData) {
                        for (const update of options.optimisticData) {
                            if (update.onyxMethod === Onyx.METHOD.MERGE) {
                                Onyx.merge(update.key as OnyxKey, update.value as OnyxMergeInput<OnyxKey>);
                            }
                        }
                    }
                    return Promise.resolve();
                },
            );

            // When verifyAddSecondaryLoginCode is called
            UserActions.verifyAddSecondaryLoginCode(validateCode);
            await waitForBatchedUpdates();

            // Then PENDING_CONTACT_ACTION should be updated with optimistic data
            const pendingContactAction = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.PENDING_CONTACT_ACTION,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(pendingContactAction).toEqual({
                validateActionCode: validateCode,
                isLoading: true,
                errorFields: {},
            });
        });
    });

    describe('addNewContactMethod', () => {
        it('should call API.write with correct parameters when validateCode is provided', async () => {
            // Given a contact method and validate code
            const contactMethod = 'test@example.com';
            const validateCode = '123456';

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod, validateCode);
            await waitForBatchedUpdates();

            // Then API.write should be called with correct parameters
            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD,
                {partnerUserID: contactMethod, validateCode},
                expect.objectContaining({
                    optimisticData: expect.any(Array) as Array<{key: string; value: unknown}>,
                    successData: expect.any(Array) as Array<{key: string; value: unknown}>,
                    failureData: expect.any(Array) as Array<{key: string; value: unknown}>,
                }),
            );
        });

        it('should call API.write with empty validateCode when validateCode is not provided', async () => {
            // Given a contact method without validate code
            const contactMethod = 'test@example.com';

            // When addNewContactMethod is called without validateCode
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();

            // Then API.write should be called with empty validateCode
            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD,
                {partnerUserID: contactMethod, validateCode: ''},
                expect.objectContaining({
                    optimisticData: expect.any(Array) as Array<{key: string; value: unknown}>,
                    successData: expect.any(Array) as Array<{key: string; value: unknown}>,
                    failureData: expect.any(Array) as Array<{key: string; value: unknown}>,
                }),
            );
        });

        it('should have correct optimisticData structure', async () => {
            // Given a contact method
            const contactMethod = 'test@example.com';

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();

            // Then verify the optimisticData structure
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (mockAPI.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, {optimisticData?: Array<{key: string; value: unknown}>}];
            const optimisticData = onyxData.optimisticData ?? [];

            expect(optimisticData).toHaveLength(3);

            // Verify LOGIN_LIST update
            const loginListUpdate = optimisticData.find((update) => update.key === ONYXKEYS.LOGIN_LIST);
            expect(loginListUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.LOGIN_LIST,
                value: {
                    [contactMethod]: {
                        partnerUserID: contactMethod,
                        validatedDate: '',
                        errorFields: {
                            addedLogin: null,
                        },
                    },
                },
            });

            // Verify ACCOUNT update
            const accountUpdate = optimisticData.find((update) => update.key === ONYXKEYS.ACCOUNT);
            expect(accountUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: true},
            });

            // Verify PENDING_CONTACT_ACTION update
            const pendingContactActionUpdate = optimisticData.find((update) => update.key === ONYXKEYS.PENDING_CONTACT_ACTION);
            expect(pendingContactActionUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PENDING_CONTACT_ACTION,
                value: {
                    contactMethod,
                    isLoading: true,
                    errorFields: {
                        actionVerified: null,
                    },
                },
            });
        });

        it('should have correct successData structure', async () => {
            // Given a contact method
            const contactMethod = 'test@example.com';

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();

            // Then verify the successData structure
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (mockAPI.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, {successData?: Array<{key: string; value: unknown}>}];
            const successData = onyxData.successData ?? [];

            expect(successData).toHaveLength(2);

            // Verify PENDING_CONTACT_ACTION success update
            const pendingContactActionUpdate = successData.find((update) => update.key === ONYXKEYS.PENDING_CONTACT_ACTION);
            expect(pendingContactActionUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PENDING_CONTACT_ACTION,
                value: {
                    actionVerified: true,
                    isLoading: false,
                    isVerifiedValidateActionCode: false,
                    validateActionCode: null,
                },
            });

            // Verify ACCOUNT success update
            const accountUpdate = successData.find((update) => update.key === ONYXKEYS.ACCOUNT);
            expect(accountUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: false},
            });
        });

        it('should have correct failureData structure', async () => {
            // Given a contact method
            const contactMethod = 'test@example.com';

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();

            // Then verify the failureData structure
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const calls = (mockAPI.write as jest.Mock).mock.calls;
            const [, , onyxData] = calls.at(0) as [unknown, unknown, {failureData?: Array<{key: string; value: unknown}>}];
            const failureData = onyxData.failureData ?? [];

            expect(failureData).toHaveLength(4);

            // Verify ACCOUNT failure update
            const accountUpdate = failureData.find((update) => update.key === ONYXKEYS.ACCOUNT);
            expect(accountUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: false},
            });

            // Verify VALIDATE_ACTION_CODE failure update
            const validateActionCodeUpdate = failureData.find((update) => update.key === ONYXKEYS.VALIDATE_ACTION_CODE);
            expect(validateActionCodeUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.VALIDATE_ACTION_CODE,
                value: {validateCodeSent: null},
            });

            // Verify PENDING_CONTACT_ACTION failure update
            const pendingContactActionUpdate = failureData.find((update) => update.key === ONYXKEYS.PENDING_CONTACT_ACTION);
            expect(pendingContactActionUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PENDING_CONTACT_ACTION,
                value: {
                    isLoading: false,
                    actionVerified: false,
                },
            });
        });

        it('should apply optimisticData to Onyx when API.write applies it', async () => {
            // Given a contact method and mock API.write that applies optimisticData
            const contactMethod = 'test@example.com';

            // Mock API.write to apply optimisticData
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            (mockAPI.write as jest.Mock).mockImplementation(
                (
                    command: unknown,
                    params: unknown,
                    options?: {
                        optimisticData?: Array<{onyxMethod: typeof Onyx.METHOD.MERGE; key: string; value: unknown}>;
                    },
                ) => {
                    if (options?.optimisticData) {
                        for (const update of options.optimisticData) {
                            if (update.onyxMethod === Onyx.METHOD.MERGE) {
                                Onyx.merge(update.key as OnyxKey, update.value as OnyxMergeInput<OnyxKey>);
                            }
                        }
                    }
                    return Promise.resolve();
                },
            );

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();

            // Then LOGIN_LIST should be updated with the new contact method
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGIN_LIST,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList?.[contactMethod]).toEqual({
                partnerUserID: contactMethod,
                validatedDate: '',
                errorFields: {},
            });

            // Then ACCOUNT should have isLoading: true
            const account = await new Promise<{isLoading?: boolean} | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(account?.isLoading).toBe(true);

            // Then PENDING_CONTACT_ACTION should be updated
            const pendingContactAction = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.PENDING_CONTACT_ACTION,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(pendingContactAction).toEqual({
                contactMethod,
                isLoading: true,
                errorFields: {},
            });
        });
    });
});
