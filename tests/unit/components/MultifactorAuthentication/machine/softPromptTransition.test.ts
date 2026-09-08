import {getDeviceBiometricsOnyxKey} from '@libs/actions/MultifactorAuthentication';

import CONST from '@src/CONST';

import Onyx from 'react-native-onyx';
import getOnyxValue from 'tests/utils/getOnyxValue';
import {createActorAtState, sendLoadRegistrationStateDone} from 'tests/utils/mfa/flowActors';
import {MFA_TEST_ACCOUNT_ID} from 'tests/utils/mfa/flowFixtures';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

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
        sendLoadRegistrationStateDone(actor, {hasLocalCredentials: true, hasEverAcceptedSoftPrompt: false});
        await waitForBatchedUpdates();

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}})).toBe(true);
        expect(result.context.softPromptApproved).toBe(false);

        actor.stop();
    });

    it('skips the soft prompt and moves directly to authorizing for a returning user who already accepted it on this device', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendLoadRegistrationStateDone(actor, {hasLocalCredentials: true, hasEverAcceptedSoftPrompt: true});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}})).toBe(true);
        expect(result.context.softPromptApproved).toBe(false);

        actor.stop();
    });

    it('still shows the soft prompt for a fresh registration even though the account already accepted it on this device before (production parity: a new registration always needs approval in this flow)', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.DECIDING_REGISTRATION}});

        actor.start();
        sendLoadRegistrationStateDone(actor, {hasLocalCredentials: false, hasEverAcceptedSoftPrompt: true});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}})).toBe(true);

        actor.stop();
    });

    it('moves to authorizing when the user approves the soft prompt', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AUTHORIZING}})).toBe(true);
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
