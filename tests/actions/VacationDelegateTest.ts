import {clearVacationDelegateError, deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import getVacationDelegateErrors from '@libs/getVacationDelegateErrors';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type Response from '@src/types/onyx/Response';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import {createGlobalFetchMock, getFetchMockCalls} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/VacationDelegate', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('setVacationDelegate', () => {
        /**
         * Mocks the side effect request so it applies the optimistic data it is handed, then runs `respond` for the response. This is
         * what the real request pipeline does, so the test sees what the action itself writes before the response arrives.
         */
        function mockSideEffectRequest(respond: () => Response<OnyxKey> | Promise<Response<OnyxKey>>) {
            return jest.spyOn(API, 'makeRequestWithSideEffects').mockImplementation(async (_command, _parameters, onyxData) => {
                await Onyx.update(onyxData?.optimisticData ?? []);
                return respond();
            });
        }

        /** Builds the 305 policy diff warning Auth sends when the picked delegate is missing from some of the vacationer's workspaces */
        function getPolicyDiffWarningResponse(policyDiff = {adminPolicies: ['1'], nonAdminPolicies: [] as string[]}): Response<OnyxKey> {
            return {jsonCode: CONST.JSON_CODE.POLICY_DIFF_WARNING, data: {policyDiff, phpCommandName: 'SetVacationDelegate', authWriteCommands: []}};
        }

        it('sends SetVacationDelegate with the mapped params and clears policyDiff optimistically', async () => {
            // Given the API side-effect call is mocked, since only the shape of the outgoing request matters here
            const apiSideEffectSpy = mockSideEffectRequest(() => ({jsonCode: CONST.JSON_CODE.SUCCESS}));

            // When a delegate is picked while another delegate is already saved
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'});

            // Then the request carries the mapped params and clears policyDiff optimistically
            expect(apiSideEffectSpy).toHaveBeenCalledWith(
                SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
                {
                    creator: 'admin@test.com',
                    vacationDelegateEmail: 'delegate@test.com',
                    overridePolicyDiffWarning: false,
                },
                {
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
                            value: expect.objectContaining({policyDiff: null, previousDelegate: 'old@test.com'}),
                        }),
                    ]),
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
                            value: expect.objectContaining({policyDiff: null}),
                        }),
                    ]),
                },
            );

            // Then no failureData is attached, because the 305 policy diff warning is a non-200 response and passing
            // failureData would make the request pipeline write an error we immediately have to clear, flashing a red
            // brick road. The action applies it from the response instead.
            expect(apiSideEffectSpy.mock.calls.at(0)?.at(2)).not.toHaveProperty('failureData');

            // Then the pick is only in the success data, because the response can still be a 305 and applying it optimistically would flash it on Profile
            const onyxData = apiSideEffectSpy.mock.calls.at(0)?.[2];
            expect(onyxData?.optimisticData?.at(0)?.value).not.toHaveProperty('delegate');
            expect(onyxData?.successData?.at(0)?.value).toEqual(expect.objectContaining({creator: 'admin@test.com', delegate: 'delegate@test.com'}));
        });

        it('sends a persisted write instead of a side effect request once the policy diff warning is overridden', async () => {
            // Given both API paths are spied on, so we can prove which one is actually used
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => undefined);
            const apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve());

            // When the user confirms the missing-workspaces step, so the override flag is set
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', shouldOverridePolicyDiffWarning: true});

            // Then only the persisted write fires, because the 305 can no longer come back and the request needs to survive offline,
            // and the pick is applied optimistically, since there is no 305 left that could take it away
            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.SET_VACATION_DELEGATE,
                expect.objectContaining({overridePolicyDiffWarning: true}),
                expect.objectContaining({optimisticData: [expect.objectContaining({value: expect.objectContaining({delegate: 'delegate@test.com'})})]}),
            );
            expect(apiSideEffectSpy).not.toHaveBeenCalled();
        });

        it('waits for queued writes to settle before starting, so their responses cannot clear the policy diff it captures', async () => {
            // Given a real fetch mock with the queue paused, so the invite step's write is still in flight, plus a
            // session so the sequential queue is able to run at all
            const mockFetch = createGlobalFetchMock();
            global.fetch = mockFetch;
            await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@test.com', accountID: 1, authToken: 'testAuthToken'});
            await waitForBatchedUpdates();

            const policyDiff = {adminPolicies: ['1'], nonAdminPolicies: ['2']};
            mockFetch.mockAPICommand(WRITE_COMMANDS.SET_VACATION_DELEGATE, (params) =>
                params.vacationDelegateEmail === 'second@test.com'
                    ? {jsonCode: CONST.JSON_CODE.POLICY_DIFF_WARNING, data: {policyDiff, phpCommandName: 'SetVacationDelegate', authWriteCommands: []}}
                    : {jsonCode: CONST.JSON_CODE.SUCCESS},
            );

            // The write sent by the invite step is still sitting in the sequential queue when the next delegate is picked.
            mockFetch.pause();
            setVacationDelegate({creator: 'admin@test.com', delegate: 'first@test.com', shouldOverridePolicyDiffWarning: true});
            await waitForBatchedUpdates();

            // When the next delegate is picked before the queued write has drained
            const request = setVacationDelegate({creator: 'admin@test.com', delegate: 'second@test.com', currentDelegate: 'first@test.com'});
            await waitForBatchedUpdates();

            // Then nothing from the second pick may reach the network or the NVP while the queued write can still respond over it
            expect(getFetchMockCalls(WRITE_COMMANDS.SET_VACATION_DELEGATE).length).toBe(1);
            expect((await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE))?.delegate).toBe('first@test.com');

            await mockFetch.resume();
            await request;
            await waitForBatchedUpdates();

            // Then, once the queue resumes, the 305 policyDiff is captured against the correct (second) delegate
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.delegate).toBe('first@test.com');
            expect(vacationDelegate?.pendingDelegate).toBe('second@test.com');
            expect(vacationDelegate?.policyDiff).toEqual(policyDiff);
        });

        it('merges the policyDiff from a 305 response into the NVP without ever surfacing an error', async () => {
            // Given an Onyx subscriber recording every errors value the NVP ever takes on, and a mocked 305 that
            // applies its optimistic data first, the same way the real request pipeline does
            const policyDiff = {adminPolicies: ['1'], nonAdminPolicies: ['2']};
            const errorStates: Array<OnyxCommon.Errors | undefined> = [];
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
                callback: (value) => errorStates.push(value?.errors),
            });

            mockSideEffectRequest(() => getPolicyDiffWarningResponse(policyDiff));

            // When a delegate is picked
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'});
            await waitForBatchedUpdates();
            Onyx.disconnect(connection);

            // Then the policyDiff is stored, pendingDelegate points at the pick, and the saved delegate is left unchanged
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.policyDiff).toEqual(policyDiff);
            expect(vacationDelegate?.pendingAction).toBeFalsy();
            expect(vacationDelegate?.pendingDelegate).toBe('delegate@test.com');
            expect(vacationDelegate?.delegate).toBe('old@test.com');
            expect(vacationDelegate?.previousDelegate).toBe('old@test.com');

            // Then no error is ever written, because an error at any point would flash a red brick road on the profile page
            expect(errorStates.every(isEmptyObject)).toBe(true);
        });

        it('clears the errors payload the backend ships in onyxData alongside a 305', async () => {
            // Given a 305 whose onyxData carries an errors payload
            const policyDiff = {adminPolicies: [], nonAdminPolicies: ['79705898949FB240']};

            mockSideEffectRequest(async () => {
                // Auth returns 305 so the client can prompt, but the same response carries an errors payload in
                // onyxData, which the API layer applies before the caller ever sees the response.
                await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
                    // an ID map key is not a name!
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    errors: {1788970253939928: "Vacation delegate is not part of all of vacationer's policies."},
                });
                return getPolicyDiffWarningResponse(policyDiff);
            });

            // When a delegate is picked
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'});
            await waitForBatchedUpdates();

            // Then no error is visible via getVacationDelegateErrors, so the confirmation step doesn't leave a red brick
            // road behind on the profile page (while the payload is in flight getVacationDelegateErrors hides it, which
            // getVacationDelegateErrors.test.ts covers), and the policyDiff/pendingDelegate are still set
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(getVacationDelegateErrors(vacationDelegate)).toBeUndefined();
            expect(vacationDelegate?.policyDiff).toEqual(policyDiff);
            expect(vacationDelegate?.pendingDelegate).toBe('delegate@test.com');
        });

        it('never writes the picked delegate to delegate when the response is a 305', async () => {
            // Given a saved delegate, an Onyx subscriber recording every delegate value the NVP takes on, and a mocked 305
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: 'admin@test.com', delegate: 'old@test.com'});
            const delegateStates: Array<string | undefined> = [];
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
                callback: (value) => delegateStates.push(value?.delegate),
            });
            mockSideEffectRequest(() => getPolicyDiffWarningResponse());

            // When a member who is missing from one of the workspaces is picked
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'});
            await waitForBatchedUpdates();
            Onyx.disconnect(connection);

            // Then the pick never shows up as the delegate, because Profile would flash it, take it away on the 305, and show it again after the
            // missing workspaces step. The saved delegate stays in place the whole time.
            expect(delegateStates.length).toBeGreaterThan(0);
            expect(delegateStates).not.toContain('delegate@test.com');
            expect(delegateStates.every((delegate) => delegate === 'old@test.com')).toBe(true);
        });

        it('never surfaces the errors the 305 ships in its onyxData through getVacationDelegateErrors', async () => {
            // Given an Onyx subscriber recording the errors getVacationDelegateErrors returns for every NVP value, and a mocked 305 whose
            // onyxData carries an errors payload that the API layer applies before the caller sees the response
            const visibleErrors: Array<OnyxCommon.Errors | undefined> = [];
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
                callback: (value) => visibleErrors.push(getVacationDelegateErrors(value)),
            });
            mockSideEffectRequest(async () => {
                await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
                    // an ID map key is not a name!
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    errors: {1788970253939928: "Vacation delegate is not part of all of vacationer's policies."},
                });
                return getPolicyDiffWarningResponse();
            });

            // When a delegate is picked
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com'});
            await waitForBatchedUpdates();
            Onyx.disconnect(connection);

            // Then the payload is never visible, because the optimistic pendingAction hides it until the action clears it, so the Profile row
            // never flashes a red brick road for what is really the next step of the flow
            expect(visibleErrors.length).toBeGreaterThan(0);
            expect(visibleErrors.every(isEmptyObject)).toBe(true);
        });

        it('clears the delegate on a 305 when there was no delegate saved before the pick', async () => {
            // Given no saved delegate and a mocked 305
            mockSideEffectRequest(() => getPolicyDiffWarningResponse());

            // When the first delegate is picked
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com'});
            await waitForBatchedUpdates();

            // Then the delegate is cleared and only pendingDelegate is set, so the profile page doesn't show an
            // unsaved delegate as though it were already saved
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.delegate).toBeFalsy();
            expect(vacationDelegate?.pendingDelegate).toBe('delegate@test.com');
        });

        it('parks the picked clear after datetime next to the pick on a 305 and puts the saved one back', async () => {
            // Given a saved delegate that clears on one date, and a mocked 305 for a pick that clears on another
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: 'admin@test.com', delegate: 'old@test.com', clearAfter: '2026-09-30 06:59:59'});
            jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(async () => ({
                jsonCode: CONST.JSON_CODE.POLICY_DIFF_WARNING,
                data: {policyDiff: {adminPolicies: ['1'], nonAdminPolicies: []}},
            }));

            // When the new delegate is picked with its clear after datetime
            await setVacationDelegate({
                creator: 'admin@test.com',
                delegate: 'delegate@test.com',
                clearAfter: '2026-10-02 06:59:59',
                currentDelegate: 'old@test.com',
                currentClearAfter: '2026-09-30 06:59:59',
            });
            await waitForBatchedUpdates();

            // Then the saved datetime stays in place, since the backend saved nothing, and the picked one waits with the pick
            // so the missing workspaces step can send it again
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.clearAfter).toBe('2026-09-30 06:59:59');
            expect(vacationDelegate?.pendingClearAfter).toBe('2026-10-02 06:59:59');
        });

        it('applies the failureData it could not attach when the response fails, since the caller may have already navigated away', async () => {
            // Given a saved delegate and a mocked non-305 error response, with no failureData attached to the request (see the first
            // test above), so the action has to apply it itself instead of relying on a caller that may no longer be mounted
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: 'admin@test.com', delegate: 'old@test.com'});
            const response = {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'Nope'};
            mockSideEffectRequest(() => response);

            // When the pick fails
            await expect(setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'})).resolves.toEqual(response);
            await waitForBatchedUpdates();

            // Then the action writes the error itself
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.pendingAction).toBeFalsy();
            expect(vacationDelegate?.errors).toBeTruthy();

            // Then the saved delegate is still in place, since the pick was never applied, and previousDelegate survives,
            // because rolling back belongs to whoever dismisses the error and needs something to roll back to
            expect(vacationDelegate?.delegate).toBe('old@test.com');
            expect(vacationDelegate?.previousDelegate).toBe('old@test.com');
        });

        it('leaves a failed response in a state where dismissing the error restores the last confirmed delegate', async () => {
            // Given a pick that fails over a previously saved delegate
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: 'admin@test.com', delegate: 'old@test.com'});
            mockSideEffectRequest(() => ({jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'Nope'}));

            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'});
            await waitForBatchedUpdates();

            // When the error is dismissed the way the profile page does it, via clearVacationDelegateError with the stored previousDelegate
            const failed = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            clearVacationDelegateError(failed?.previousDelegate);
            await waitForBatchedUpdates();

            // Then the last confirmed delegate is restored, because a failure that cleared previousDelegate would
            // delete the delegate the user actually has instead of restoring it, and errors are cleared
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.delegate).toBe('old@test.com');
            expect(vacationDelegate?.errors).toBeFalsy();
        });

        it('does not merge a policyDiff on a successful (200) response', async () => {
            // Given a mocked 200
            jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve({jsonCode: 200}));

            // When a delegate is picked
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com'});
            await waitForBatchedUpdates();

            // Then no policyDiff is stored, so no missing-workspaces step opens
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.policyDiff).toBeFalsy();
        });
    });

    describe('deleteVacationDelegate', () => {
        it('does not leave the deleted delegate as the rollback target of the next pick', async () => {
            // Given a saved delegate and a session, so the sequential queue is able to run
            const mockFetch = createGlobalFetchMock();
            global.fetch = mockFetch;
            await Onyx.set(ONYXKEYS.SESSION, {email: 'admin@test.com', accountID: 1, authToken: 'testAuthToken'});
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {creator: 'admin@test.com', delegate: 'a@test.com'});
            await waitForBatchedUpdates();

            // When the delegate is deleted
            deleteVacationDelegate({creator: 'admin@test.com', delegate: 'a@test.com'});
            await waitForBatchedUpdates();

            // Then the delegate is gone and there is no previousDelegate left to roll back to
            const afterDelete = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(afterDelete?.delegate).toBeFalsy();
            expect(afterDelete?.previousDelegate).toBeFalsy();

            // Given a mocked 305 for picking a new delegate (B), now that there is nothing to roll back to
            jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(async () => {
                await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {delegate: 'b@test.com', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
                return {jsonCode: CONST.JSON_CODE.POLICY_DIFF_WARNING, data: {policyDiff: {adminPolicies: ['1'], nonAdminPolicies: []}}};
            });

            // When B is picked and the resulting missing-workspaces step is dismissed
            await setVacationDelegate({creator: 'admin@test.com', delegate: 'b@test.com', currentDelegate: afterDelete?.delegate});
            await waitForBatchedUpdates();

            const afterPick = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            clearVacationDelegateError(afterPick?.previousDelegate);
            await waitForBatchedUpdates();

            // Then the deleted delegate (A) does not come back
            expect((await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE))?.delegate).toBeFalsy();
        });
    });

    describe('clearVacationDelegateError', () => {
        it('clears errors, pendingAction, and policyDiff, and restores the previous delegate', async () => {
            // Given an NVP populated with every field the error path can leave behind
            const timestamp = 123;
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
                creator: 'admin@test.com',
                delegate: 'delegate@test.com',
                previousDelegate: 'old@test.com',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: {[timestamp]: 'Some error'},
                policyDiff: {adminPolicies: ['1'], nonAdminPolicies: []},
                pendingDelegate: 'delegate@test.com',
            });

            // When the error is dismissed
            clearVacationDelegateError('old@test.com');
            await waitForBatchedUpdates();

            // Then everything the error path could have left behind is cleared and the previous delegate is restored
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.delegate).toBe('old@test.com');
            expect(vacationDelegate?.previousDelegate).toBeFalsy();
            expect(vacationDelegate?.errors).toBeFalsy();
            expect(vacationDelegate?.pendingAction).toBeFalsy();
            expect(vacationDelegate?.policyDiff).toBeFalsy();
            expect(vacationDelegate?.pendingDelegate).toBeFalsy();
        });

        it('restores the previous clear after datetime along with the previous delegate', async () => {
            // Given a failed change that replaced both the delegate and the datetime it clears after
            const timestamp = 123;
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
                delegate: 'delegate@test.com',
                clearAfter: '2026-10-02 06:59:59',
                previousDelegate: 'old@test.com',
                previousClearAfter: '2026-09-30 06:59:59',
                pendingClearAfter: '2026-10-02 06:59:59',
                errors: {[timestamp]: 'Some error'},
            });

            // When the error is dismissed
            clearVacationDelegateError('old@test.com', '2026-09-30 06:59:59');
            await waitForBatchedUpdates();

            // Then the last confirmed datetime is back, so the profile does not show a date the backend never saved
            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.clearAfter).toBe('2026-09-30 06:59:59');
            expect(vacationDelegate?.previousClearAfter).toBeFalsy();
            expect(vacationDelegate?.pendingClearAfter).toBeFalsy();
        });
    });
});
