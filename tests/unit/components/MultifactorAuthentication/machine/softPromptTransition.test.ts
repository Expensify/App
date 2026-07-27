import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {CheckLocalCredentialsInput, ReadHasAcceptedSoftPromptInput, ValidateDeviceInput} from '@components/MultifactorAuthentication/machine/types';

import {getDeviceBiometricsOnyxKey} from '@libs/actions/MultifactorAuthentication';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import Onyx from 'react-native-onyx';
import getOnyxValue from 'tests/utils/getOnyxValue';
import {createActorAtState, sendCheckLocalCredentialsDone} from 'tests/utils/mfa/flowActors';
import createInitEvent, {MFA_TEST_ACCOUNT_ID} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';
import {createActor, fromPromise} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the soft-prompt
// transitions and the persisted acceptance by hand.

describe('MFA soft prompt', () => {
    afterEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('moves a registered account to the soft prompt when the current account has not accepted it', async () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendCheckLocalCredentialsDone(actor, true);
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}})).toBe(true);
        expect(result.context.softPromptApproved).toBe(false);

        actor.stop();
    });

    it('skips the soft prompt when the user has already accepted it on this device', async () => {
        await Onyx.merge(getDeviceBiometricsOnyxKey(MFA_TEST_ACCOUNT_ID), {hasAcceptedSoftPrompt: true});
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendCheckLocalCredentialsDone(actor, true);
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
        // The context flag tracks an approval given during this flow, so a skip leaves it false.
        expect(result.context.softPromptApproved).toBe(false);

        actor.stop();
    });

    it('disconnects a pending soft-prompt read when the flow closes', () => {
        const connection = {id: 'soft-prompt-read-test', callbackID: 'soft-prompt-read-test'};
        jest.spyOn(Onyx, 'connectWithoutView').mockReturnValue(connection);
        const disconnectSpy = jest.spyOn(Onyx, 'disconnect').mockImplementation();
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendCheckLocalCredentialsDone(actor, true);
        expect(actor.getSnapshot().matches({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}})).toBe(true);

        actor.send({type: 'CLOSE_MODAL'});

        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        expect(disconnectSpy).toHaveBeenCalledWith(connection);

        actor.stop();
    });

    it('ends the current flow with an error when reading the soft-prompt flag rejects', async () => {
        const machine = mfaMachine.provide({
            actors: {
                validateDevice: fromPromise<MFAResult, ValidateDeviceInput>(() => Promise.resolve({success: true})),
                // A registered account routes the flow straight to the soft-prompt read under test.
                checkLocalCredentials: fromPromise<boolean, CheckLocalCredentialsInput>(() => Promise.resolve(true)),
                readHasAcceptedSoftPrompt: fromPromise<boolean, ReadHasAcceptedSoftPromptInput>(() => Promise.reject(new Error('Onyx read failed'))),
            },
        });
        const actor = createActor(machine);

        actor.start();
        actor.send(createInitEvent());
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.error?.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION);
        expect(result.context.error?.message).toContain('Soft-prompt acceptance read threw: Onyx read failed');

        actor.stop();
    });

    it('reaches the success outcome when the user approves the soft prompt', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
        expect(result.context.softPromptApproved).toBe(true);

        actor.stop();
    });

    it('persists the acceptance for the current user when the soft prompt is approved', async () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});
        await waitForBatchedUpdates();

        const deviceBiometrics = await getOnyxValue(getDeviceBiometricsOnyxKey(MFA_TEST_ACCOUNT_ID));
        expect(deviceBiometrics?.hasAcceptedSoftPrompt).toBe(true);

        actor.stop();
    });
});
