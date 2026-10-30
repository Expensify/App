import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as API from '@libs/API';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import Pusher from '@libs/Pusher';
import type {EventData} from '@libs/Pusher/types';
import PusherUtils from '@libs/PusherUtils';
import * as RequestModule from '@libs/Request';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {NewLogin} from '@src/types/onyx';

import {CONST as COMMON_CONST} from 'expensify-common';
import Onyx from 'react-native-onyx';

import * as App from '../../src/libs/actions/App';
import * as OnyxUpdatesReliably from '../../src/libs/actions/applyOnyxUpdatesReliably';
import * as DeviceActions from '../../src/libs/actions/Device';
import redirectToSignIn from '../../src/libs/actions/SignInRedirect';
import * as UserActions from '../../src/libs/actions/User';
import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import PusherHelper from '../utils/PusherHelper';
import {anyArray, anyObject, anyString, formatPhoneNumber} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API');
jest.mock('../../src/libs/actions/SignInRedirect');

const mockAPI = jest.mocked(API);

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

    describe('updateTheme', () => {
        it('only stores the theme locally for a passed anonymous session even when the stored session is signed in', async () => {
            // Given a signed-in session stored in Onyx
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, email: 'user@example.com'});
            await waitForBatchedUpdates();
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write');

            // When the theme is updated for an anonymous session passed by the caller
            UserActions.updateTheme(CONST.THEME.DARK_CONTRAST, false, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            await waitForBatchedUpdates();

            // Then the passed session decides: the preference is saved locally and not sent to the server
            expect(apiWriteSpy).not.toHaveBeenCalled();
            expect(await getOnyxValue(ONYXKEYS.PREFERRED_THEME)).toBe(CONST.THEME.DARK_CONTRAST);
            apiWriteSpy.mockRestore();
        });

        it('sends the theme to the server for a passed signed-in session even when the stored session is anonymous', async () => {
            // Given an anonymous session with an accountID stored in Onyx, as during an anonymous-to-signed-in transition
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            await waitForBatchedUpdates();
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write');

            // When the theme is updated for a signed-in session passed by the caller
            UserActions.updateTheme(CONST.THEME.DARK_CONTRAST, false, {accountID: 1, email: 'user@example.com'});
            await waitForBatchedUpdates();

            // Then the passed session decides: the preference is saved on the server for the signed-in user
            expect(apiWriteSpy).toHaveBeenCalledTimes(1);
            apiWriteSpy.mockRestore();
        });
    });

    describe('joinExactOnlineWaitlist', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('queues the signup timestamp with a rollback to the absent value', () => {
            // Given the account has not joined the waitlist
            const signupTimestamp = '2026-10-14 10:00:00.000';
            const errorTimestamp = 1;
            const getDBTime = jest.spyOn(DateUtils, 'getDBTime').mockReturnValue(signupTimestamp);
            jest.spyOn(DateUtils, 'getMicroseconds').mockReturnValue(errorTimestamp);

            // When the account joins the waitlist
            UserActions.joinExactOnlineWaitlist();

            // Then the queued request and confirmed signup share one timestamp, with the previous value restored on failure
            expect(getDBTime).toHaveBeenCalledTimes(1);
            expect(mockAPI.write).toHaveBeenCalledTimes(1);
            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_NAME_VALUE_PAIR,
                {name: ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, value: signupTimestamp},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.ACCOUNT,
                            value: {pendingFields: {exactOnlineWaitlist: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}, errorFields: {exactOnlineWaitlist: null}},
                        },
                    ],
                    successData: [
                        {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, value: signupTimestamp},
                        {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.ACCOUNT, value: {pendingFields: {exactOnlineWaitlist: null}}},
                    ],
                    failureData: [
                        {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST, value: ''},
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.ACCOUNT,
                            value: {pendingFields: {exactOnlineWaitlist: null}, errorFields: {exactOnlineWaitlist: {[errorTimestamp]: anyString}}},
                        },
                    ],
                },
            );
        });
    });

    describe('clearContactMethod', () => {
        it('should return early when contactMethods array is empty', async () => {
            // Given an empty array
            const contactMethods: string[] = [];

            // When clearContactMethod is called
            UserActions.clearContactMethod(contactMethods);
            await waitForBatchedUpdates();

            // Then LOGINS should remain unchanged (null/undefined)
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGINS,
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
                [`1_${contactMethod}`]: {
                    partnerID: 1,
                    partnerUserID: contactMethod,
                    validatedDate: '2024-01-01',
                },
            };

            await Onyx.merge(ONYXKEYS.LOGINS, initialLoginList);
            await waitForBatchedUpdates();

            // When clearContactMethod is called with that contact method
            UserActions.clearContactMethod([contactMethod]);
            await waitForBatchedUpdates();

            // Then the contact method should be set to null in LOGINS
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGINS,
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
                [`1_${contactMethod1}`]: {
                    partnerID: 1,
                    partnerUserID: contactMethod1,
                    validatedDate: '2024-01-01',
                },
                [`1_${contactMethod2}`]: {
                    partnerID: 1,
                    partnerUserID: contactMethod2,
                    validatedDate: '2024-01-02',
                },
                [`1_${contactMethod3}`]: {
                    partnerID: 1,
                    partnerUserID: contactMethod3,
                    validatedDate: '2024-01-03',
                },
            };

            await Onyx.merge(ONYXKEYS.LOGINS, initialLoginList);
            await waitForBatchedUpdates();

            // When clearContactMethod is called with multiple contact methods
            UserActions.clearContactMethod([contactMethod1, contactMethod3]);
            await waitForBatchedUpdates();

            // Then the specified contact methods should be set to null, while others remain unchanged
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGINS,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList).toEqual({
                [`1_${contactMethod2}`]: {
                    partnerID: 1,
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
                [`1_${existingContactMethod}`]: {
                    partnerID: 1,
                    partnerUserID: existingContactMethod,
                    validatedDate: '2024-01-01',
                },
            };

            await Onyx.merge(ONYXKEYS.LOGINS, initialLoginList);
            await waitForBatchedUpdates();

            // When clearContactMethod is called with both existing and non-existent contact methods
            UserActions.clearContactMethod([existingContactMethod, nonExistentContactMethod]);
            await waitForBatchedUpdates();

            // Then both should be set to null in LOGINS
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGINS,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList).toEqual({});
        });
    });

    describe('dismissMarketingWindow', () => {
        it('should dismiss the supplied marketing update key optimistically', async () => {
            const updateKey = 'productUpdateJuly2026';

            UserActions.dismissMarketingWindow(updateKey);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.DISMISS_MARKETING_WINDOW,
                {updateKey},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.NVP_LAST_DISMISSED_MARKETING_WINDOW,
                            value: updateKey,
                        },
                    ],
                },
            );
        });
    });

    describe('closeAccount', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('restarts the HybridApp sign-in flow after the server clears Onyx, so the account can be reopened', async () => {
            // Given a HybridApp user who already finished signing in, so the HybridApp sign-in page is no longer in use
            jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', true);
            mockAPI.write.mockResolvedValue(undefined);
            await Onyx.merge(ONYXKEYS.HYBRID_APP, {readyToShowAuthScreens: true, useNewDotSignInPage: false});
            await waitForBatchedUpdates();

            // When the account is closed and the server responds by clearing all Onyx data before the successData is applied
            UserActions.closeAccount('Leaving', '123456');
            await waitForBatchedUpdates();
            const successData = mockAPI.write.mock.calls.at(0)?.[2]?.successData ?? [];
            await Onyx.clear();
            await Onyx.update(successData);
            await waitForBatchedUpdates();

            // Then the HybridApp sign-in flow starts from the beginning, so signing in with a magic code shows the signed-in screens
            expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual({readyToShowAuthScreens: false, useNewDotSignInPage: true});
        });

        it('does not touch the HybridApp sign-in flow outside of HybridApp', async () => {
            // Given a user outside of HybridApp
            jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', false);
            mockAPI.write.mockResolvedValue(undefined);

            // When the account is closed
            UserActions.closeAccount('Leaving', '123456');
            await waitForBatchedUpdates();

            // Then no HybridApp data is written, because the HybridApp sign-in flags are only used by HybridApp
            expect(mockAPI.write.mock.calls.at(0)?.[2]?.successData).toEqual([]);
        });
    });

    describe('verifyAddSecondaryLoginCode', () => {
        it('should call API.write with correct parameters', async () => {
            // Given a validate code
            const validateCode = '123456';

            // When verifyAddSecondaryLoginCode is called
            UserActions.verifyAddSecondaryLoginCode(validateCode);
            await waitForBatchedUpdates();

            // Then API.write should be called with correct parameters
            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.VERIFY_ADD_SECONDARY_LOGIN_CODE,
                {validateCode},
                expect.objectContaining({
                    optimisticData: anyArray,
                    successData: anyArray,
                    failureData: anyArray,
                }),
            );
        });

        it('should apply optimisticData correctly', async () => {
            // Given a validate code
            const validateCode = '123456';

            // When verifyAddSecondaryLoginCode is called
            UserActions.verifyAddSecondaryLoginCode(validateCode);
            await waitForBatchedUpdates();

            // Then verify the optimisticData structure

            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const optimisticData = onyxData?.optimisticData ?? [];

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

            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const successData = onyxData?.successData ?? [];

            expect(successData).toHaveLength(2);
            expect(successData.at(0)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PENDING_CONTACT_ACTION,
                value: {
                    isVerifiedValidateActionCode: true,
                    isLoading: false,
                },
            });
            expect(successData.at(1)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.VALIDATE_ACTION_CODE,
                value: {
                    lastValidateCodeRequestedAt: null,
                    lastValidateCodeReason: null,
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

            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const failureData = onyxData?.failureData ?? [];

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

            mockAPI.write.mockImplementation((_command, _params, options) => {
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });

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

    describe('requestValidateCodeAction', () => {
        it('should set lastValidateCodeRequestedAt optimistically and clear it on failure', () => {
            // When requestValidateCodeAction is called
            UserActions.requestValidateCodeAction();

            return waitForBatchedUpdates().then(() => {
                // Then API.write targets RESEND_VALIDATE_CODE, stamping a numeric request time optimistically
                // (so the gate can de-duplicate reloads within the resend window) and reverting it to null on
                // failure (so a failed request never suppresses the next send).
                const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
                const optimisticUpdate = onyxData?.optimisticData?.find((update) => update.key === ONYXKEYS.VALIDATE_ACTION_CODE);
                const failureUpdate = onyxData?.failureData?.find((update) => update.key === ONYXKEYS.VALIDATE_ACTION_CODE);

                // expect.any(...) is typed as `any`; hold it in an `unknown` so the matcher can be used without an unsafe assignment.
                const anyNumber: unknown = expect.any(Number);

                expect(mockAPI.write.mock.calls.at(0)?.[0]).toBe(WRITE_COMMANDS.RESEND_VALIDATE_CODE);
                expect(optimisticUpdate?.value).toEqual(expect.objectContaining({lastValidateCodeRequestedAt: anyNumber, lastValidateCodeReason: null}));
                expect(failureUpdate?.value).toEqual(expect.objectContaining({lastValidateCodeRequestedAt: null, lastValidateCodeReason: null}));
            });
        });

        it('should store the reason atomically with the timestamp when a reasonCode is provided', () => {
            UserActions.requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD});

            return waitForBatchedUpdates().then(() => {
                const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
                const optimisticUpdate = onyxData?.optimisticData?.find((update) => update.key === ONYXKEYS.VALIDATE_ACTION_CODE);
                const anyNumber: unknown = expect.any(Number);

                expect(optimisticUpdate?.value).toEqual(
                    expect.objectContaining({
                        lastValidateCodeRequestedAt: anyNumber,
                        lastValidateCodeReason: COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD,
                    }),
                );
            });
        });

        it('should forward no reason to the backend when called without params (e.g. physical-card shipping)', () => {
            // When requestValidateCodeAction is called with no params
            UserActions.requestValidateCodeAction();

            return waitForBatchedUpdates().then(() => {
                // Then RESEND_VALIDATE_CODE is sent with a null payload, so the backend uses the generic email copy
                expect(mockAPI.write.mock.calls.at(0)?.[0]).toBe(WRITE_COMMANDS.RESEND_VALIDATE_CODE);
                expect(mockAPI.write.mock.calls.at(0)?.[1]).toBeNull();
            });
        });

        it('should forward the reveal reason and card ID to the backend so the card-reveal email is sent', () => {
            // Given a virtual card being revealed via the missing-personal-details flow
            const reasonCardID = 885522;

            // When requestValidateCodeAction is called with the reveal reason
            UserActions.requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS, reasonCardID});

            return waitForBatchedUpdates().then(() => {
                // Then RESEND_VALIDATE_CODE carries the reason/card ID the backend keys the templated email off
                expect(mockAPI.write.mock.calls.at(0)?.[0]).toBe(WRITE_COMMANDS.RESEND_VALIDATE_CODE);
                expect(mockAPI.write.mock.calls.at(0)?.[1]).toEqual({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REVEAL_CARD_DETAILS, reasonCardID});
            });
        });
    });

    describe('requestEmailUnblock', () => {
        it('should call API.write with USER_UNBLOCK_EMAIL and no params', async () => {
            // Given the user is on the email issue page

            // When requestEmailUnblock is called
            UserActions.requestEmailUnblock();
            await waitForBatchedUpdates();

            // Then API.write targets USER_UNBLOCK_EMAIL with null params, since the backend derives the email from the session
            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.USER_UNBLOCK_EMAIL,
                null,
                expect.objectContaining({
                    optimisticData: anyArray,
                    successData: anyArray,
                    failureData: anyArray,
                }),
            );
        });

        it('should set isUnblockingEmail optimistically', async () => {
            // When requestEmailUnblock is called
            UserActions.requestEmailUnblock();
            await waitForBatchedUpdates();

            // Then the optimistic update flags the account as unblocking
            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const optimisticUpdate = onyxData?.optimisticData?.find((update) => update.key === ONYXKEYS.ACCOUNT);

            expect(optimisticUpdate?.value).toEqual({isUnblockingEmail: true});
        });

        it('should clear isUnblockingEmail on both success and failure without writing to account.errors', async () => {
            // When requestEmailUnblock is called
            UserActions.requestEmailUnblock();
            await waitForBatchedUpdates();

            // Then both branches clear the loading flag, and neither writes account.errors: the ConfirmModal on
            // EmailIssuePage is the only failure surface (deliberate deviation from the generic-error spec).
            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const successUpdate = onyxData?.successData?.find((update) => update.key === ONYXKEYS.ACCOUNT);
            const failureUpdate = onyxData?.failureData?.find((update) => update.key === ONYXKEYS.ACCOUNT);

            expect(successUpdate?.value).toEqual({isUnblockingEmail: false});
            expect(failureUpdate?.value).toEqual({isUnblockingEmail: false});
        });
    });

    describe('validateSecondaryLogin', () => {
        beforeEach(() => {
            jest.spyOn(DeviceActions, 'getDeviceInfoWithID').mockResolvedValue('{"deviceID":"test-device"}');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should clear the validate-code stamp in successData alongside validated: true', async () => {
            const contactMethod = 'test@example.com';
            const validateCode = '123456';

            UserActions.validateSecondaryLogin(contactMethod, validateCode);
            await waitForBatchedUpdates();

            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const successData = onyxData?.successData ?? [];
            const validateActionCodeUpdate = successData.find((update) => update.key === ONYXKEYS.VALIDATE_ACTION_CODE);
            const accountUpdate = successData.find((update) => update.key === ONYXKEYS.ACCOUNT);

            expect(validateActionCodeUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.VALIDATE_ACTION_CODE,
                value: {
                    lastValidateCodeRequestedAt: null,
                    lastValidateCodeReason: null,
                },
            });
            expect(accountUpdate?.value).toEqual(expect.objectContaining({validated: true}));
        });

        it('should not clear the validate-code stamp in failureData', async () => {
            const contactMethod = 'test@example.com';
            const validateCode = '123456';

            UserActions.validateSecondaryLogin(contactMethod, validateCode);
            await waitForBatchedUpdates();

            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const failureData = onyxData?.failureData ?? [];
            const validateActionCodeUpdate = failureData.find((update) => update.key === ONYXKEYS.VALIDATE_ACTION_CODE);

            expect(validateActionCodeUpdate).toBeUndefined();
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
                    optimisticData: anyArray,
                    successData: anyArray,
                    failureData: anyArray,
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
                    optimisticData: anyArray,
                    successData: anyArray,
                    failureData: anyArray,
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

            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const optimisticData = onyxData?.optimisticData ?? [];

            expect(optimisticData).toHaveLength(3);

            // Verify LOGINS update
            const loginListUpdate = optimisticData.find((update) => update.key === ONYXKEYS.LOGINS);
            expect(loginListUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.LOGINS,
                value: {
                    [`1_${contactMethod}`]: {
                        partnerID: 1,
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
            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const successData = onyxData?.successData ?? [];

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

            const onyxData = mockAPI.write.mock.calls.at(0)?.[2];
            const failureData = onyxData?.failureData ?? [];

            expect(failureData).toHaveLength(3);

            // Verify ACCOUNT failure update
            const accountUpdate = failureData.find((update) => update.key === ONYXKEYS.ACCOUNT);
            expect(accountUpdate).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: false},
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

        it('should show the server error over the generic fallback even when the device clock is ahead of the server', async () => {
            // Given a server error stamped by the server clock and a device clock 3 seconds ahead of it
            const contactMethod = 'test@example.com';
            const serverErrorKey = Date.now() * 1000;
            const serverErrorMessage = 'Cannot add an existing Expensify account as a new contact method.';
            const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 3000);

            // And a failing request whose server response writes its error before failureData is applied
            mockAPI.write.mockImplementation((_command, _params, options) => {
                Onyx.merge(ONYXKEYS.LOGINS, {[`1_${contactMethod}`]: {errorFields: {addedLogin: {[serverErrorKey]: serverErrorMessage}}}});
                for (const update of options?.failureData ?? []) {
                    Onyx.merge(update.key, update.value);
                }
                return Promise.resolve();
            });

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();
            dateNowSpy.mockRestore();

            // Then the fallback is keyed with 0, so the server error sorts as the latest error and is shown
            const logins = await getOnyxValue(ONYXKEYS.LOGINS);
            const login = logins?.[`1_${contactMethod}`];
            expect(Object.keys(login?.errorFields?.addedLogin ?? {})).toContain('0');
            expect(getLatestErrorField(login, 'addedLogin')).toEqual({[serverErrorKey]: serverErrorMessage});
        });

        it('should show the generic fallback when the server does not send an error', async () => {
            // Given a contact method and a failing request with no server error
            const contactMethod = 'test@example.com';
            mockAPI.write.mockImplementation((_command, _params, options) => {
                for (const update of options?.failureData ?? []) {
                    Onyx.merge(update.key, update.value);
                }
                return Promise.resolve();
            });

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();

            // Then the fallback is the only error, so it is still shown
            const logins = await getOnyxValue(ONYXKEYS.LOGINS);
            const latestError = getLatestErrorField(logins?.[`1_${contactMethod}`], 'addedLogin');
            expect(Object.keys(latestError)).toEqual(['0']);
            expect(Object.values(latestError).at(0)).toBeTruthy();
        });

        it('should apply optimisticData to Onyx when API.write applies it', async () => {
            // Given a contact method and mock API.write that applies optimisticData
            const contactMethod = 'test@example.com';

            // Mock API.write to apply optimisticData

            mockAPI.write.mockImplementation((_command, _params, options) => {
                if (options?.optimisticData) {
                    for (const update of options.optimisticData) {
                        if (update.onyxMethod === Onyx.METHOD.MERGE) {
                            Onyx.merge(update.key, update.value);
                        }
                    }
                }
                return Promise.resolve();
            });

            // When addNewContactMethod is called
            UserActions.addNewContactMethod(contactMethod);
            await waitForBatchedUpdates();

            // Then LOGINS should be updated with the new contact method
            const loginList = await new Promise<Record<string, unknown> | null>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.LOGINS,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value ?? null);
                    },
                });
            });

            expect(loginList?.[`1_${contactMethod}`]).toEqual({
                partnerID: 1,
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

    describe('openMultifactorAuthenticationRevokePage', () => {
        it('should call API.read with the correct command', () => {
            // When the function is called
            UserActions.openMultifactorAuthenticationRevokePage();

            // Then it should issue a read API call with the correct command
            expect(mockAPI.read).toHaveBeenCalledWith(READ_COMMANDS.OPEN_MULTIFACTOR_AUTHENTICATION_REVOKE_PAGE, null);
        });
    });

    describe('lockAccount', () => {
        const currentUserAccountID = 999;
        it('should execute with explicit accountID ', async () => {
            const accountID = 123456;
            UserActions.lockAccount(currentUserAccountID, accountID, undefined, undefined);

            await waitForBatchedUpdates();

            expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(
                SIDE_EFFECT_REQUEST_COMMANDS.LOCK_ACCOUNT,
                {accountID},
                expect.objectContaining({
                    optimisticData: anyArray,
                    successData: anyArray,
                    failureData: anyArray,
                }),
            );
        });

        it('should execute without accountID (uses current user)', async () => {
            UserActions.lockAccount(currentUserAccountID, undefined, undefined, undefined);
            await waitForBatchedUpdates();

            expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LOCK_ACCOUNT, {accountID: currentUserAccountID}, anyObject);
        });

        it('should pass domainAccountID and domainName as params when provided', async () => {
            const accountID = 100;
            const domainAccountID = 200;
            const domainName = 'expensify.com';

            UserActions.lockAccount(currentUserAccountID, accountID, domainAccountID, domainName);
            await waitForBatchedUpdates();

            expect(mockAPI.makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LOCK_ACCOUNT, {accountID, domainAccountID, domainName}, anyObject);
        });

        describe('when locking current user (no accountID or matching currentUserAccountID)', () => {
            it('should include correct ACCOUNT optimistic, success, and failure data', async () => {
                UserActions.lockAccount(currentUserAccountID, undefined, undefined, undefined);
                await waitForBatchedUpdates();

                const onyxData = mockAPI.makeRequestWithSideEffects.mock.calls.at(0)?.[2];

                const optimisticAccountUpdate = onyxData?.optimisticData?.find((update) => update.key === ONYXKEYS.ACCOUNT);
                expect(optimisticAccountUpdate).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {
                        isLoading: true,
                        lockAccount: {errors: null},
                    },
                });

                const successAccountUpdate = onyxData?.successData?.find((update) => update.key === ONYXKEYS.ACCOUNT);
                expect(successAccountUpdate).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.ACCOUNT,
                    value: {
                        isLoading: false,
                        lockAccount: {errors: null},
                    },
                });

                const failureAccountUpdate = onyxData?.failureData?.find((update) => update.key === ONYXKEYS.ACCOUNT);
                expect(failureAccountUpdate).toEqual(
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: ONYXKEYS.ACCOUNT,
                        value: expect.objectContaining({
                            isLoading: false,
                            errors: anyObject,
                        }),
                    }),
                );
            });

            it('should NOT include domain-related onyx data', async () => {
                UserActions.lockAccount(currentUserAccountID, undefined, undefined, undefined);
                await waitForBatchedUpdates();

                const onyxData = mockAPI.makeRequestWithSideEffects.mock.calls.at(0)?.[2];

                expect(
                    onyxData?.optimisticData?.some(
                        (update) =>
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN) ||
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS) ||
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_ERRORS),
                    ) ?? false,
                ).toBe(false);
                expect(
                    onyxData?.successData?.some(
                        (update) =>
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN) ||
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS) ||
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_ERRORS),
                    ) ?? false,
                ).toBe(false);
                expect(
                    onyxData?.failureData?.some(
                        (update) =>
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN) ||
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS) ||
                            update.key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_ERRORS),
                    ) ?? false,
                ).toBe(false);
            });
        });

        describe('when locking another user via domain (accountID + domainAccountID)', () => {
            const accountID = 100;
            const domainAccountID = 200;
            const domainName = 'expensify.com';
            const userLockKey = `${CONST.DOMAIN.PRIVATE_LOCKED_ACCOUNT_PREFIX}${accountID}`;

            it('should include correct domain optimistic, success, and failure data', async () => {
                UserActions.lockAccount(currentUserAccountID, accountID, domainAccountID, domainName);
                await waitForBatchedUpdates();

                const onyxData = mockAPI.makeRequestWithSideEffects.mock.calls.at(0)?.[2];
                const optimisticData = onyxData?.optimisticData ?? [];
                const failureData = onyxData?.failureData ?? [];
                const successData = onyxData?.successData ?? [];

                // Optimistic: sets lock flag to true
                expect(optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`)).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                    value: {[userLockKey]: true},
                });

                // Optimistic: sets pending action to UPDATE
                expect(optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`)).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                    value: {member: {[accountID]: {lockAccount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}},
                });

                // Optimistic: clears errors
                expect(optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`)).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                    value: {memberErrors: {[accountID]: {lockAccountErrors: null}}},
                });

                // Failure: reverts lock flag to false
                expect(failureData.find((update) => update.key === `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`)).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                    value: {[userLockKey]: false},
                });

                // Failure: clears pending actions
                expect(failureData.find((update) => update.key === `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`)).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                    value: {member: {[accountID]: {lockAccount: null}}},
                });

                // Failure: sets lock account errors
                expect(failureData.find((update) => update.key === `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`)).toEqual(
                    expect.objectContaining({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                        value: {memberErrors: {[accountID]: {lockAccountErrors: anyObject}}},
                    }),
                );

                // Success: clears pending actions
                expect(successData.find((update) => update.key === `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`)).toEqual({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                    value: {member: {[accountID]: {lockAccount: null}}},
                });
            });

            it('should NOT include ACCOUNT data when locking a different user', async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {accountID: 999, email: 'admin@expensify.com'});
                await waitForBatchedUpdates();

                UserActions.lockAccount(currentUserAccountID, accountID, domainAccountID, domainName);
                await waitForBatchedUpdates();

                const onyxData = mockAPI.makeRequestWithSideEffects.mock.calls.at(0)?.[2];

                expect(onyxData?.optimisticData?.some((update) => update.key === ONYXKEYS.ACCOUNT) ?? false).toBe(false);
                expect(onyxData?.successData?.some((update) => update.key === ONYXKEYS.ACCOUNT) ?? false).toBe(false);
                expect(onyxData?.failureData?.some((update) => update.key === ONYXKEYS.ACCOUNT) ?? false).toBe(false);
            });
        });
    });

    describe('requestUnlockAccount', () => {
        it('should call API.write with REQUEST_UNLOCK_ACCOUNT command and explicit accountID', async () => {
            const accountID = 123456;
            UserActions.requestUnlockAccount(accountID);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.REQUEST_UNLOCK_ACCOUNT, {accountID});
        });
    });

    describe('respondToProactiveAppReview', () => {
        const TEST_USER_ACCOUNT_ID = 42;
        const TEST_USER_EMAIL = 'user@example.com';
        const TEST_CONCIERGE_REPORT_ID = '999';
        const TEST_POLICY_ID = '123';

        it('should call RESPOND_TO_PROACTIVE_APP_REVIEW API with the given response', async () => {
            UserActions.respondToProactiveAppReview('positive', undefined, TEST_USER_EMAIL, TEST_USER_ACCOUNT_ID, undefined, TEST_POLICY_ID);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.RESPOND_TO_PROACTIVE_APP_REVIEW, expect.objectContaining({response: 'positive'}), expect.anything());
        });

        it('should call RESPOND_TO_PROACTIVE_APP_REVIEW API with skip response', async () => {
            UserActions.respondToProactiveAppReview('skip', undefined, TEST_USER_EMAIL, TEST_USER_ACCOUNT_ID, undefined, TEST_POLICY_ID);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.RESPOND_TO_PROACTIVE_APP_REVIEW, expect.objectContaining({response: 'skip'}), expect.anything());
        });

        it('should include optimisticReportActionID when message and conciergeChatReportID are provided for non-skip response', async () => {
            UserActions.respondToProactiveAppReview('positive', undefined, TEST_USER_EMAIL, TEST_USER_ACCOUNT_ID, undefined, TEST_POLICY_ID, 'Great app!', TEST_CONCIERGE_REPORT_ID);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.RESPOND_TO_PROACTIVE_APP_REVIEW,
                expect.objectContaining({
                    response: 'positive',
                    optimisticReportActionID: anyString,
                }),
                expect.anything(),
            );
        });

        it('should NOT include optimisticReportActionID when response is skip even with message', async () => {
            UserActions.respondToProactiveAppReview('skip', undefined, TEST_USER_EMAIL, TEST_USER_ACCOUNT_ID, undefined, TEST_POLICY_ID, 'Some message', TEST_CONCIERGE_REPORT_ID);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(WRITE_COMMANDS.RESPOND_TO_PROACTIVE_APP_REVIEW, expect.not.objectContaining({optimisticReportActionID: anyString}), expect.anything());
        });

        it('should optimistically update NVP_APP_REVIEW with the response', async () => {
            const currentReview = {response: 'positive' as const, lastPrompt: '2024-01-01 00:00:00.000'};
            await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, currentReview);
            await waitForBatchedUpdates();

            UserActions.respondToProactiveAppReview('negative', currentReview, TEST_USER_EMAIL, TEST_USER_ACCOUNT_ID, undefined, TEST_POLICY_ID);
            await waitForBatchedUpdates();

            expect(mockAPI.write).toHaveBeenCalledWith(
                WRITE_COMMANDS.RESPOND_TO_PROACTIVE_APP_REVIEW,
                expect.objectContaining({response: 'negative', policyID: TEST_POLICY_ID}),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.NVP_APP_REVIEW,
                            value: expect.objectContaining({response: 'negative'}),
                        }),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.NVP_APP_REVIEW,
                            value: expect.objectContaining({response: 'positive'}),
                        }),
                    ]),
                }),
            );
        });
    });

    describe('revokeDevice', () => {
        it('should include correct optimistic, success, and failure data', async () => {
            // Given a device to revoke
            const partnerID = CONST.PARTNER_ID.IPHONE;
            const partnerUserID = 'device_123';
            const loginKey = `${partnerID}_${partnerUserID}`;
            const login = createMock<NewLogin>({partnerID, partnerUserID});

            // When revokeDevice is called
            UserActions.revokeDevice(login, 'a');
            await waitForBatchedUpdates();

            // Then API.write should be called with correct command and parameters
            const lastCall = mockAPI.write.mock.calls.at(-1);
            const command = lastCall?.[0];
            const parameters = lastCall?.[1];
            const onyxData = lastCall?.[2];

            expect(command).toBe(WRITE_COMMANDS.REVOKE_DEVICE);
            expect(parameters).toEqual({partnerID, partnerUserID});

            const optimisticData = onyxData?.optimisticData ?? [];
            const successData = onyxData?.successData ?? [];
            const failureData = onyxData?.failureData ?? [];

            // And it should include correct optimistic, success, and failure data structures
            // Optimistic: sets pendingAction to DELETE
            expect(optimisticData.find((update) => update.key === ONYXKEYS.LOGINS)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.LOGINS,
                value: {
                    [loginKey]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            });

            // Success: clears the login
            expect(successData.find((update) => update.key === ONYXKEYS.LOGINS)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.LOGINS,
                value: {
                    [loginKey]: null,
                },
            });

            // Failure: reverts pendingAction and sets error
            expect(failureData.find((update) => update.key === ONYXKEYS.LOGINS)).toEqual({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.LOGINS,
                value: {
                    [loginKey]: {
                        errorFields: {
                            revoke: anyObject,
                        },
                        pendingAction: null,
                    },
                },
            });
        });

        it('should call redirectToSignIn when the device belongs to the current user', async () => {
            // Given a device to revoke that belongs to the current user
            const partnerID = CONST.PARTNER_ID.IPHONE;
            const partnerUserID = 'device_123';
            const autoGeneratedLogin = 'device_123';
            const login = createMock<NewLogin>({partnerID, partnerUserID});

            mockAPI.write.mockResolvedValue(undefined);

            // When revokeDevice is called
            UserActions.revokeDevice(login, autoGeneratedLogin);
            await waitForBatchedUpdates();

            // Then redirectToSignIn should be called
            expect(redirectToSignIn).toHaveBeenCalled();
        });
    });

    describe('subscribeToUserEvents AGENT_ZERO_PROCESSING_STATUS', () => {
        const CHANNEL_NAME = `${CONST.PUSHER.PRIVATE_USER_CHANNEL_PREFIX}1${CONFIG.PUSHER.SUFFIX}`;
        const ACTOR_ACCOUNT_ID = 123;
        const REPORT_NVP_KEY = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}1001` as const;
        const PARENT_REPORT_NVP_KEY = `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}1002` as const;
        const processingStatusEvent: EventData<typeof Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS> = {
            updates: [REPORT_NVP_KEY, PARENT_REPORT_NVP_KEY].map((key) => ({
                onyxMethod: 'merge',
                key,
                value: {agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}},
            })),
        };

        beforeEach(async () => {
            jest.spyOn(ActiveClientManager, 'isClientTheLeader').mockReturnValue(true);
            jest.spyOn(OnyxUpdatesReliably, 'default').mockResolvedValue(undefined);
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, email: 'test@example.com'});
            await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 42);
            await waitForBatchedUpdates();
            PusherHelper.setup();
            UserActions.subscribeToUserEvents(1, 'test@example.com', () => undefined, formatPhoneNumber, undefined);
            await waitForBatchedUpdates();
        });

        afterEach(() => {
            PusherHelper.teardown();
            jest.restoreAllMocks();
        });

        it('sets and clears processing labels without advancing or recovering the reliable update stream', async () => {
            // Given a subscribed client with a synchronization watermark
            expect(await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT)).toBe(42);

            // When temporary status updates arrive for a report and its parent
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
            await waitForBatchedUpdates();

            // Then both reports show the processing label
            expect(await getOnyxValue(REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}});
            expect(await getOnyxValue(PARENT_REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}});

            // When the agent finishes and clears its processing labels
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, {
                updates: processingStatusEvent.updates.map((update) => ({...update, value: {agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: null}}})),
            });
            await waitForBatchedUpdates();

            // Then the labels clear without affecting the synchronization watermark or fetching catch-up updates
            expect(await getOnyxValue(REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {}});
            expect(await getOnyxValue(PARENT_REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {}});
            expect(await getOnyxValue(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT)).toBe(42);
            expect(OnyxUpdatesReliably.default).not.toHaveBeenCalled();
            expect(API.makeRequestWithSideEffects).not.toHaveBeenCalled();
        });

        it('applies new processing status after an older OpenApp response clears the indicator', async () => {
            // Given an earlier OpenApp request is still applying its response
            let finishRequest = () => {};
            const currentRequest = new Promise<void>((resolve) => {
                finishRequest = resolve;
            });
            jest.spyOn(SequentialQueue, 'getCurrentRequest').mockReturnValue(currentRequest);

            // When a new processing status arrives before that response completes
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
            await waitForBatchedUpdates();

            // Then the status waits for the earlier request
            expect(await getOnyxValue(REPORT_NVP_KEY)).toBeUndefined();

            // When the older snapshot clears the indicator and finishes
            await Onyx.merge(REPORT_NVP_KEY, {agentZeroProcessingRequestIndicator: null});
            finishRequest();
            await waitForBatchedUpdates();

            // Then the new label survives the older response
            expect(await getOnyxValue(REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: 'Thinking...'}});
        });

        it('keeps a newer clear after status events arrive during different queued requests', async () => {
            // Given two requests waiting in the real sequential queue
            SequentialQueue.resetQueue();
            let finishFirstRequest = () => {};
            let finishSecondRequest = () => {};
            const firstRequest = new Promise<void>((resolve) => {
                finishFirstRequest = resolve;
            });
            const secondRequest = new Promise<void>((resolve) => {
                finishSecondRequest = resolve;
            });
            const processSpy = jest.spyOn(RequestModule, 'processWithMiddleware').mockReturnValueOnce(firstRequest).mockReturnValueOnce(secondRequest);
            await SequentialQueue.push({command: 'OpenApp'});
            await waitForBatchedUpdates();
            await SequentialQueue.push({command: 'ReadNewestAction'});
            expect(processSpy).toHaveBeenCalledTimes(1);

            // When a thinking label arrives during the first request and that request finishes
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
            finishFirstRequest();
            await waitForBatchedUpdates();

            // Then the next request starts while the label is still waiting
            expect(processSpy).toHaveBeenCalledTimes(2);
            expect(await getOnyxValue(REPORT_NVP_KEY)).toBeUndefined();

            // When the clear arrives during the second request and the queue drains
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, {
                updates: processingStatusEvent.updates.map((update) => ({...update, value: {agentZeroProcessingRequestIndicator: {[ACTOR_ACCOUNT_ID]: null}}})),
            });
            finishSecondRequest();
            await waitForBatchedUpdates();

            // Then the newer clear wins over the earlier thinking label
            expect(await getOnyxValue(REPORT_NVP_KEY)).toEqual({agentZeroProcessingRequestIndicator: {}});
        });

        it('ignores processing status events on a non-leader client', async () => {
            // Given another client is responsible for updating shared Onyx data
            jest.mocked(ActiveClientManager.isClientTheLeader).mockReturnValue(false);

            // When a temporary processing status arrives
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
            await waitForBatchedUpdates();

            // Then this client leaves the report unchanged
            expect(await getOnyxValue(REPORT_NVP_KEY)).toBeUndefined();
        });

        it.each([undefined, 2])('ignores processing status from an earlier session after the account changes to %s', async (accountID) => {
            // Given a status listener is waiting for the current account's API request
            let finishRequest = () => {};
            const currentRequest = new Promise<void>((resolve) => {
                finishRequest = resolve;
            });
            jest.spyOn(SequentialQueue, 'getCurrentRequest').mockReturnValue(currentRequest);

            // When a status arrives and the account signs out or changes before the request finishes
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
            await Onyx.set(ONYXKEYS.SESSION, accountID ? {accountID} : null);
            await waitForBatchedUpdates();
            finishRequest();
            await waitForBatchedUpdates();

            // Then it cannot populate the new session's report data
            expect(await getOnyxValue(REPORT_NVP_KEY)).toBeUndefined();
        });

        it('reports a failed local status update', async () => {
            // Given Onyx cannot apply the temporary status update
            jest.spyOn(Onyx, 'update').mockRejectedValueOnce(new Error('apply failed'));
            const alertSpy = jest.spyOn(Log, 'alert');

            // When a processing status arrives
            Pusher.sendEvent(CHANNEL_NAME, Pusher.TYPE.AGENT_ZERO_PROCESSING_STATUS, processingStatusEvent);
            await waitForBatchedUpdates();

            // Then the failure is logged without an unhandled rejection or a synchronization recovery
            expect(alertSpy).toHaveBeenCalledWith('[subscribeToUserEvents] Applying Agent Zero processing status failed', expect.objectContaining({error: 'apply failed'}));
            expect(OnyxUpdatesReliably.default).not.toHaveBeenCalled();
        });
    });

    describe('subscribeToUserEvents RECONNECT_APP', () => {
        const reconnectAppMock = jest.fn();

        beforeEach(() => {
            reconnectAppMock.mockClear();
            jest.spyOn(App, 'reconnectApp').mockImplementation(reconnectAppMock);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('passes lastUpdateIDAppliedToClient when reconnecting as an anonymous user', async () => {
            const lastUpdateID = 42;
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS, accountID: 1, authToken: 'anon'});
            await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateID);
            await waitForBatchedUpdates();

            UserActions.subscribeToUserEvents(1, 'anon@test.com', () => {}, formatPhoneNumber, undefined);
            await waitForBatchedUpdates();

            await PusherUtils.triggerMultiEventHandler(Pusher.TYPE.MULTIPLE_EVENT_TYPE.RECONNECT_APP, []);
            await waitForBatchedUpdates();

            expect(reconnectAppMock).toHaveBeenCalledWith(lastUpdateID);
        });

        it('passes lastUpdateIDAppliedToClient when reconnecting as an authenticated user', async () => {
            // Given a signed-in device that has already applied updates up to a known ID
            const lastUpdateID = 42;
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: undefined, accountID: 1, authToken: 'token'});
            await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateID);
            await waitForBatchedUpdates();

            UserActions.subscribeToUserEvents(1, 'test@test.com', () => {}, formatPhoneNumber, undefined);
            await waitForBatchedUpdates();

            // When the account-wide RECONNECT_APP event arrives (for example, because another device signed in)
            await PusherUtils.triggerMultiEventHandler(Pusher.TYPE.MULTIPLE_EVENT_TYPE.RECONNECT_APP, []);
            await waitForBatchedUpdates();

            // Then the reconnect is incremental, so a full ReconnectApp doesn't wipe report actions this device already has
            expect(reconnectAppMock).toHaveBeenCalledWith(lastUpdateID);
        });

        it('falls back to a full reconnect when the client has no lastUpdateIDAppliedToClient', async () => {
            // Given a signed-in device that has not applied any updates yet
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: undefined, accountID: 1, authToken: 'token'});
            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, null);
            await waitForBatchedUpdates();

            UserActions.subscribeToUserEvents(1, 'test@test.com', () => {}, formatPhoneNumber, undefined);
            await waitForBatchedUpdates();

            // When the RECONNECT_APP event arrives
            await PusherUtils.triggerMultiEventHandler(Pusher.TYPE.MULTIPLE_EVENT_TYPE.RECONNECT_APP, []);
            await waitForBatchedUpdates();

            // Then no updateIDFrom is passed, so reconnectApp still does a full reconnect to recover
            expect(reconnectAppMock).toHaveBeenCalledWith(undefined);
        });
    });
});
