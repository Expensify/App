import {getDeviceBiometricsOnyxKey} from '@libs/actions/MultifactorAuthentication';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import getOnyxValue from 'tests/utils/getOnyxValue';
import {createActorAtState, sendValidateDeviceDone} from 'tests/utils/mfa/flowActors';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const TEST_ACCOUNT_ID = 12345;

// The graph-traversal suites generate their expectations from the machine, so a transition pointed at
// a wrong target adjusts those expectations and still passes. This suite pins the soft-prompt hops by
// hand: eligible device -> soft prompt, and approval -> success outcome plus the persisted acceptance.

describe('MFA soft prompt', () => {
    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('moves an eligible device to the soft prompt without approving it', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.VALIDATING_DEVICE}});

        actor.start();
        sendValidateDeviceDone(actor, {success: true});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}})).toBe(true);
        expect(result.context.softPromptApproved).toBe(false);

        actor.stop();
    });

    it('skips the soft prompt when the user has already accepted it on this device', async () => {
        // The skip guard resolves the acceptance through non-reactive Onyx reads, so both the
        // session and the device-biometrics entry must settle before the device check completes.
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID});
        await Onyx.merge(getDeviceBiometricsOnyxKey(TEST_ACCOUNT_ID), {hasAcceptedSoftPrompt: true});
        await waitForBatchedUpdates();
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.VALIDATING_DEVICE}});

        actor.start();
        sendValidateDeviceDone(actor, {success: true});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
        // The context flag tracks an approval given during this flow, so a skip leaves it false.
        expect(result.context.softPromptApproved).toBe(false);

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
        // The machine's persist action resolves the account through a non-reactive session read, so
        // the session must settle before the event fires.
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID});
        await waitForBatchedUpdates();
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});
        await waitForBatchedUpdates();

        const deviceBiometrics = await getOnyxValue(getDeviceBiometricsOnyxKey(TEST_ACCOUNT_ID));
        expect(deviceBiometrics?.hasAcceptedSoftPrompt).toBe(true);

        actor.stop();
    });
});
