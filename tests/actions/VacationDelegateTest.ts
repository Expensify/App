import {clearVacationDelegateError, setVacationDelegate} from '@libs/actions/VacationDelegate';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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

    describe('setVacationDelegate', () => {
        it('sends SetVacationDelegate with the mapped params and clears policyDiff optimistically', async () => {
            const apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve());

            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'});

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

            // The 305 policy diff warning is a non-200 response, so passing failureData would make the request pipeline
            // write an error we immediately have to clear, flashing a red brick road. The action applies it from the response instead.
            expect(apiSideEffectSpy.mock.calls.at(0)?.at(2)).not.toHaveProperty('failureData');

            apiSideEffectSpy.mockRestore();
        });

        it('sends a persisted write instead of a side effect request once the policy diff warning is overridden', async () => {
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => undefined);
            const apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve());

            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', shouldOverridePolicyDiffWarning: true});

            expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.SET_VACATION_DELEGATE, expect.objectContaining({overridePolicyDiffWarning: true}), expect.anything());
            expect(apiSideEffectSpy).not.toHaveBeenCalled();

            jest.restoreAllMocks();
        });

        it('waits for queued writes to settle before starting, so their responses cannot clear the policy diff it captures', async () => {
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

            const request = setVacationDelegate({creator: 'admin@test.com', delegate: 'second@test.com', currentDelegate: 'first@test.com'});
            await waitForBatchedUpdates();

            // Nothing of the second selection may reach the network or the NVP while the queued write can still respond over it.
            expect(getFetchMockCalls(WRITE_COMMANDS.SET_VACATION_DELEGATE).length).toBe(1);
            expect((await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE))?.delegate).toBe('first@test.com');

            await mockFetch.resume();
            await request;
            await waitForBatchedUpdates();

            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.delegate).toBe('second@test.com');
            expect(vacationDelegate?.policyDiff).toEqual(policyDiff);
        });

        it('merges the policyDiff from a 305 response into the NVP without ever surfacing an error', async () => {
            const policyDiff = {adminPolicies: ['1'], nonAdminPolicies: ['2']};
            const errorStates: Array<OnyxCommon.Errors | undefined> = [];
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE,
                callback: (value) => errorStates.push(value?.errors),
            });

            jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(async () => {
                // The optimistic data is applied before the response resolves.
                await Onyx.merge(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
                    creator: 'admin@test.com',
                    delegate: 'delegate@test.com',
                    previousDelegate: 'old@test.com',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    errors: null,
                });
                return {jsonCode: CONST.JSON_CODE.POLICY_DIFF_WARNING, data: {policyDiff}};
            });

            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com', currentDelegate: 'old@test.com'});
            await waitForBatchedUpdates();
            Onyx.disconnect(connection);

            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.policyDiff).toEqual(policyDiff);
            expect(vacationDelegate?.pendingAction).toBeFalsy();
            expect(vacationDelegate?.delegate).toBe('delegate@test.com');
            expect(vacationDelegate?.previousDelegate).toBe('old@test.com');

            // An error at any point would flash a red brick road on the profile page, so it must never be written at all.
            expect(errorStates.every(isEmptyObject)).toBe(true);

            jest.restoreAllMocks();
        });

        it('writes no error on a failed response, leaving the caller to report it', async () => {
            const response = {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'Nope'};
            jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve(response));

            // An error here would light up a red brick road on the profile page, which reads as something being broken.
            await expect(setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com'})).resolves.toEqual(response);
            await waitForBatchedUpdates();

            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.errors).toBeFalsy();
        });

        it('does not merge a policyDiff on a successful (200) response', async () => {
            jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve({jsonCode: 200}));

            await setVacationDelegate({creator: 'admin@test.com', delegate: 'delegate@test.com'});
            await waitForBatchedUpdates();

            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.policyDiff).toBeFalsy();

            jest.restoreAllMocks();
        });
    });

    describe('clearVacationDelegateError', () => {
        it('clears errors, pendingAction, and policyDiff, and restores the previous delegate', async () => {
            const timestamp = 123;
            await Onyx.set(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {
                creator: 'admin@test.com',
                delegate: 'delegate@test.com',
                previousDelegate: 'old@test.com',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                errors: {[timestamp]: 'Some error'},
                policyDiff: {adminPolicies: ['1'], nonAdminPolicies: []},
            });

            clearVacationDelegateError('old@test.com');
            await waitForBatchedUpdates();

            const vacationDelegate = await getOnyxValue(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
            expect(vacationDelegate?.delegate).toBe('old@test.com');
            expect(vacationDelegate?.previousDelegate).toBeFalsy();
            expect(vacationDelegate?.errors).toBeFalsy();
            expect(vacationDelegate?.pendingAction).toBeFalsy();
            expect(vacationDelegate?.policyDiff).toBeFalsy();
        });
    });
});
