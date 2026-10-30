import {
    addDelegate,
    clearDelegateErrorsByField,
    clearDelegatorErrors,
    clearOnyxForDelegateTransition,
    connect,
    isConnectedAsDelegate,
    removeDelegate,
    removeSelfAsDelegate,
    restoreDelegateSession,
    resumeSelfRemovalAsDelegate,
    updateDelegateRole,
} from '@libs/actions/Delegate';
import * as API from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import HttpUtils from '@libs/HttpUtils';
import {clearPreservedNavigatorStates, getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import navigationRef from '@libs/Navigation/navigationRef';
import {pause, resetQueue} from '@libs/Network/SequentialQueue';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {DelegatedAccess} from '@src/types/onyx/Account';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/Delegate', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('clearDelegatorErrors', () => {
        it('should clear delegator errors', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegators: [
                    {
                        email: 'test@test.com',
                        // @ts-expect-error - errorFields is not defined in the type
                        errorFields: {
                            addDelegate: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                '12211': {
                                    email: 'Invalid email address',
                                },
                            },
                        },
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        // @ts-expect-error - errorFields is not defined in the type
                        expect(account?.delegatedAccess?.delegators?.at(0)?.errorFields).toBeDefined();
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });

            clearDelegatorErrors({delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        // @ts-expect-error - errorFields is not defined in the type
                        expect(account?.delegatedAccess?.delegators?.at(0)?.errorFields).toBeUndefined();
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });
    });
    describe('addDelegate', () => {
        it('should add a delegate', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [],
            };
            await waitForBatchedUpdates();

            addDelegate({email: 'test@test.com', role: CONST.DELEGATE_ROLE.ALL, validateCode: '123456', delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        expect(account?.delegatedAccess?.delegates?.at(0)?.email).toBe('test@test.com');
                        expect(account?.delegatedAccess?.delegates?.at(0)?.role).toBe(CONST.DELEGATE_ROLE.ALL);
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });

        it('should update the role of an existing delegate entry left over from a failed add', async () => {
            // Given a delegate that is still pending because a previous add attempt failed
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        pendingFields: {
                            email: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            role: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            // When the user retries the add with a different role
            addDelegate({email: 'test@test.com', role: CONST.DELEGATE_ROLE.SUBMITTER, validateCode: '123456', delegatedAccess});
            await waitForBatchedUpdates();

            // Then the leftover entry shows the newly selected role instead of the stale one
            const account = await getOnyxValue(ONYXKEYS.ACCOUNT);
            expect(account?.delegatedAccess?.delegates?.length).toBe(1);
            expect(account?.delegatedAccess?.delegates?.at(0)?.role).toBe(CONST.DELEGATE_ROLE.SUBMITTER);
        });
    });
    describe('removeDelegate', () => {
        it('should remove a delegate', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            pause();

            removeDelegate({email: 'test@test.com', delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        expect(account?.delegatedAccess?.delegates?.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });
        resetQueue();
    });
    describe('clearDelegateErrorsByField', () => {
        it('should clear a delegate error by field', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
                errorFields: {
                    addDelegate: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'test@test.com': {
                            email: 'Invalid email address',
                        },
                    },
                },
            };

            // Set initial Onyx state
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            // Clear an error in a simple field
            clearDelegateErrorsByField({
                email: 'test@test.com',
                fieldName: 'addDelegate',
                delegatedAccess,
            });
            await waitForBatchedUpdates();

            // Assert
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        const errorFields = account?.delegatedAccess?.errorFields;

                        // The targeted errors should be cleared
                        expect(errorFields?.addDelegate?.['test@test.com']).toBeUndefined();

                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });
    });

    describe('updateDelegateRole', () => {
        it('should update a delegate role', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            pause();

            updateDelegateRole({email: 'test@test.com', role: CONST.DELEGATE_ROLE.SUBMITTER, validateCode: '123456', delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        const firstDelegate = account?.delegatedAccess?.delegates?.at(0);
                        expect(firstDelegate?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        expect(firstDelegate?.pendingFields?.role).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });

            resetQueue();
        });
    });
    describe('isConnectedAsDelegate', () => {
        it('should return true if the user is connected as a delegate', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        expect(isConnectedAsDelegate({delegatedAccess: account?.delegatedAccess})).toBe(false);
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });
    });

    describe('connect', () => {
        it('does not stash the delegate session over the original one when already connected as a delegate', async () => {
            const stashedSession = {authToken: 'originalAuthToken', email: 'copilot@test.com', accountID: 1};
            const stashedCredentials = {autoGeneratedLogin: 'originalLogin', autoGeneratedPassword: 'originalPassword'};

            await Onyx.multiSet({
                [ONYXKEYS.ACCOUNT]: {delegatedAccess: {delegate: 'delegator@test.com', delegators: [{email: 'delegator@test.com', role: CONST.DELEGATE_ROLE.ALL}]}},
                [ONYXKEYS.STASHED_SESSION]: stashedSession,
                [ONYXKEYS.STASHED_CREDENTIALS]: stashedCredentials,
            });
            await waitForBatchedUpdates();

            const result = connect({
                email: 'delegator@test.com',
                delegatedAccess: {delegate: 'delegator@test.com', delegators: [{email: 'delegator@test.com', role: CONST.DELEGATE_ROLE.ALL}]},
                credentials: {},
                session: {authToken: 'restrictedToken', authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE},
                activePolicyID: undefined,
            });
            await waitForBatchedUpdates();

            expect(result).toBeUndefined();
            await expect(getOnyxValue(ONYXKEYS.STASHED_SESSION)).resolves.toEqual(stashedSession);
            await expect(getOnyxValue(ONYXKEYS.STASHED_CREDENTIALS)).resolves.toEqual(stashedCredentials);
        });
    });

    // Stubbing the flow's API methods counts as chained API calls for this rule
    /* eslint-disable rulesdir/no-multiple-api-calls */
    describe('removeSelfAsDelegate', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it.each([
            [
                'removes the copilot access once the server restores the original session',
                {authToken: 'copilotRefreshedToken', encryptedAuthToken: 'encrypted', requesterID: 2, requesterEmail: 'copilot@test.com'},
                false,
                true,
                {email: 'copilot@test.com', authToken: 'copilotRefreshedToken'},
            ],
            [
                'removes the copilot access when restoring the original session is interrupted after SESSION was written',
                {authToken: 'copilotRefreshedToken', encryptedAuthToken: 'encrypted', requesterID: 2, requesterEmail: 'copilot@test.com'},
                true,
                true,
                {email: 'copilot@test.com', authToken: 'copilotRefreshedToken'},
            ],
            [
                'removes the copilot access once the original session is restored from the stash',
                {authToken: undefined, encryptedAuthToken: undefined, requesterID: undefined, requesterEmail: undefined},
                false,
                true,
                {email: 'copilot@test.com', authToken: 'copilotAuthToken'},
            ],
            [
                'keeps the copilot access and shows an error when the original session could not be restored',
                new Error('Network error'),
                false,
                false,
                {email: 'delegator@test.com', authToken: 'restrictedToken'},
            ],
        ])('%s', async (_description, disconnectResponse, shouldOpenAppFail, shouldRemoveDelegator, expectedSession) => {
            // Given a copilot acting as the delegator, with their own session and login stashed
            const stashedSession = {authToken: 'copilotAuthToken', email: 'copilot@test.com', accountID: 2};
            const stashedCredentials = {autoGeneratedLogin: 'copilotLogin', autoGeneratedPassword: 'copilotPassword'};
            await Onyx.set(ONYXKEYS.SESSION, {authToken: 'restrictedToken', email: 'delegator@test.com', accountID: 1, authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE});
            let pendingRemovalAtDisconnect: string | undefined;
            jest.spyOn(API, 'makeRequestWithSideEffects').mockImplementation(async () => {
                pendingRemovalAtDisconnect = await getOnyxValue(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL);
                if (disconnectResponse instanceof Error) {
                    throw disconnectResponse;
                }
                return {jsonCode: CONST.JSON_CODE.SUCCESS, ...disconnectResponse};
            });
            jest.spyOn(API, 'writeWithNoDuplicatesOpenAppConflictAction').mockImplementation(() => (shouldOpenAppFail ? Promise.reject(new Error('OpenApp failed')) : Promise.resolve()));
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);
            const readSpy = jest.spyOn(API, 'read').mockImplementation(() => {});

            // When the copilot removes themselves from the delegator's copilots
            await removeSelfAsDelegate({delegatorEmail: 'delegator@test.com', delegateEmail: 'copilot@test.com', stashedCredentials, stashedSession});
            await waitForBatchedUpdates();

            // Then the removal is saved as pending before the session is ended, so a kill mid-flow can't lose it
            expect(pendingRemovalAtDisconnect).toBe('delegator@test.com');

            // And the access is revoked only once the copilot is back on their own account, so the app never runs on a revoked token
            const removeDelegatorCalls = writeSpy.mock.calls.filter(([command]) => command === WRITE_COMMANDS.REMOVE_DELEGATOR);
            expect(removeDelegatorCalls).toHaveLength(shouldRemoveDelegator ? 1 : 0);
            await expect(getOnyxValue(ONYXKEYS.SESSION)).resolves.toEqual(expect.objectContaining(expectedSession));
            if (shouldRemoveDelegator) {
                expect(writeSpy).toHaveBeenCalledWith(
                    WRITE_COMMANDS.REMOVE_DELEGATOR,
                    {delegatorEmail: 'delegator@test.com'},
                    expect.objectContaining({optimisticData: expect.arrayContaining([{onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL, value: null}])}),
                );
                expect(readSpy).toHaveBeenCalledWith(READ_COMMANDS.OPEN_SECURITY_SETTINGS_PAGE, null);
                return;
            }

            // And a failed restore leaves the copilot on the delegator's account with an error on their own row and nothing pending
            const account = await getOnyxValue(ONYXKEYS.ACCOUNT);
            expect(account?.delegatedAccess?.errorFields?.removeDelegate?.['copilot@test.com']).toBeDefined();
            await expect(getOnyxValue(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL)).resolves.toBeUndefined();
        });
    });

    describe('resumeSelfRemovalAsDelegate', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it.each([
            ['queues the removal once the copilot is back on their own account', false, 1],
            ['cancels the removal when the copilot is still acting as the delegator, as the restore never happened', true, 0],
        ])('%s', async (_description, isDelegateSession, expectedRemoveDelegatorCalls) => {
            // Given a self-removal that a kill interrupted after it was saved as pending
            await Onyx.set(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL, 'delegator@test.com');
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);
            jest.spyOn(API, 'read').mockImplementation(() => {});

            // When the app starts again
            resumeSelfRemovalAsDelegate({delegatorEmail: 'delegator@test.com', isDelegateSession});
            await waitForBatchedUpdates();

            // Then the removal is only completed when the copilot's own session was restored
            const removeDelegatorCalls = writeSpy.mock.calls.filter(([command]) => command === WRITE_COMMANDS.REMOVE_DELEGATOR);
            expect(removeDelegatorCalls).toHaveLength(expectedRemoveDelegatorCalls);
            if (isDelegateSession) {
                await expect(getOnyxValue(ONYXKEYS.PENDING_SELF_COPILOT_REMOVAL)).resolves.toBeUndefined();
            }
        });
    });

    describe('restoreDelegateSession', () => {
        afterEach(() => {
            jest.restoreAllMocks();
            clearPreservedNavigatorStates();
        });

        it('resets navigation so the restored account does not land on screens of the account it switched from', async () => {
            // Given a copilot who opened the delegator's workspace chat, so the Inbox tab still holds it
            const preservedReportsNavigatorKey = `${NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}-key`;
            setPreservedNavigatorState(preservedReportsNavigatorKey, {
                key: 'reportsState',
                index: 1,
                routeNames: [SCREENS.INBOX, SCREENS.REPORT],
                routes: [
                    {key: 'inbox', name: SCREENS.INBOX},
                    {key: 'report', name: SCREENS.REPORT, params: {reportID: '1'}},
                ],
                stale: false,
                type: 'stack',
            });
            jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
            const resetRootSpy = jest.spyOn(navigationRef, 'resetRoot').mockImplementation(() => {});
            jest.spyOn(API, 'writeWithNoDuplicatesOpenAppConflictAction').mockResolvedValue(undefined);
            jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});

            // When the copilot switches back to their own account
            await restoreDelegateSession({
                authToken: 'copilotAuthToken',
                encryptedAuthToken: 'encrypted',
                accountID: 2,
                email: 'copilot@test.com',
                stashedCredentials: {},
                stashedSession: {},
            });
            await waitForBatchedUpdates();

            // Then the delegator's screens are dropped and the app starts again from the Settings tab, where accounts are switched
            expect(getPreservedNavigatorState(preservedReportsNavigatorKey)).toBeUndefined();
            expect(resetRootSpy).toHaveBeenCalledTimes(1);
            const resetState = resetRootSpy.mock.calls.at(0)?.at(0);
            const tabNavigatorState = resetState?.routes.at(resetState.index ?? -1)?.state;
            expect(tabNavigatorState?.routes.at(tabNavigatorState.index ?? -1)?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        });

        it('finishes the switch when resetting navigation throws', async () => {
            // Given a navigation reset that throws, after the auth token was already swapped to the restored account
            await Onyx.set(ONYXKEYS.STASHED_SESSION, {accountID: 2, email: 'copilot@test.com'});
            jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
            jest.spyOn(navigationRef, 'resetRoot').mockImplementation(() => {
                throw new Error('Invalid navigation state');
            });
            jest.spyOn(API, 'writeWithNoDuplicatesOpenAppConflictAction').mockResolvedValue(undefined);
            jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});

            // When the copilot switches back to their own account
            await restoreDelegateSession({
                authToken: 'copilotAuthToken',
                encryptedAuthToken: 'encrypted',
                accountID: 2,
                email: 'copilot@test.com',
                stashedCredentials: {},
                stashedSession: {},
            });
            await waitForBatchedUpdates();

            // Then Onyx is still cleared and reseeded, so the restored account never sees the previous account's data
            expect(await getOnyxValue(ONYXKEYS.STASHED_SESSION)).toEqual({});
            expect((await getOnyxValue(ONYXKEYS.CREDENTIALS))?.accountID).toBe(2);
        });
    });
    /* eslint-enable rulesdir/no-multiple-api-calls */

    describe('clearOnyxForDelegateTransition', () => {
        it('keeps IS_LOADING_APP=true after the clear so DelegateAccessHandler does not see HAS_LOADED_APP=true && IS_LOADING_APP=undefined and fire a duplicate openApp', async () => {
            // Simulate the pre-switch state: app is fully loaded with the previous account.
            await Onyx.multiSet({
                [ONYXKEYS.HAS_LOADED_APP]: true,
                [ONYXKEYS.IS_LOADING_APP]: false,
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
            });
            await waitForBatchedUpdates();

            await clearOnyxForDelegateTransition();
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const conn = Onyx.connect({
                    key: ONYXKEYS.IS_LOADING_APP,
                    callback: (value) => {
                        expect(value).toBe(true);
                        Onyx.disconnect(conn);
                        resolve();
                    },
                });
            });

            // HAS_LOADED_APP is in the preserve list and should remain true.
            await new Promise<void>((resolve) => {
                const conn = Onyx.connect({
                    key: ONYXKEYS.HAS_LOADED_APP,
                    callback: (value) => {
                        expect(value).toBe(true);
                        Onyx.disconnect(conn);
                        resolve();
                    },
                });
            });

            // A non-preserved key should have been cleared.
            await new Promise<void>((resolve) => {
                const conn = Onyx.connect({
                    key: ONYXKEYS.NVP_PRIORITY_MODE,
                    callback: (value) => {
                        expect(value).toBeUndefined();
                        Onyx.disconnect(conn);
                        resolve();
                    },
                });
            });
        });

        it('seeds LAST_FULL_RECONNECT_TIME so subscribeToFullReconnect does not fire a duplicate ReconnectApp before OpenApp successData arrives', async () => {
            // Simulate the pre-switch state: timestamp is empty, mimicking the post-clear baseline.
            await Onyx.multiSet({
                [ONYXKEYS.LAST_FULL_RECONNECT_TIME]: null,
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
            });
            await waitForBatchedUpdates();

            const before = DateUtils.getDBTime();
            await clearOnyxForDelegateTransition();
            await waitForBatchedUpdates();

            // The timestamp must be a non-empty DB time string seeded at-or-after `before`.
            await new Promise<void>((resolve) => {
                const conn = Onyx.connect({
                    key: ONYXKEYS.LAST_FULL_RECONNECT_TIME,
                    callback: (value) => {
                        expect(typeof value).toBe('string');
                        expect(value && value.length > 0).toBe(true);
                        expect((value ?? '') >= before).toBe(true);
                        Onyx.disconnect(conn);
                        resolve();
                    },
                });
            });

            // A non-preserved key should still have been cleared alongside the seed.
            await new Promise<void>((resolve) => {
                const conn = Onyx.connect({
                    key: ONYXKEYS.NVP_PRIORITY_MODE,
                    callback: (value) => {
                        expect(value).toBeUndefined();
                        Onyx.disconnect(conn);
                        resolve();
                    },
                });
            });
        });
    });
});
