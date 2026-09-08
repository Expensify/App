import snapshotToState from '@components/MultifactorAuthentication/machine/snapshotToState';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import {createActorAtState, sendAuthorizeDone, sendCreateCredentialDone, sendRequestRegistrationChallengeDone} from 'tests/utils/mfa/flowActors';
import {MFA_TEST_AUTH_METHOD, MFA_TEST_REGISTRATION_CHALLENGE, MFA_TEST_SCENARIO_RESPONSE, MFA_TEST_VALIDATE_CODE} from 'tests/utils/mfa/flowFixtures';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

// Regresses a flicker: the prompt/validate-code screens stay mounted while the navigator animates the
// replace into the next screen, so their "processing" flags must keep their last value instead of
// flipping the instant the machine moves on. Cases below drive a live transition into the processing
// state first (not `createActorAtState` alone), because the freeze is set by that state's entry action.

describe('MFA presentation phase survives outgoing screen transitions', () => {
    it('keeps the prompt marked as authorizing after authorization succeeds', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});
        sendAuthorizeDone(actor, {success: true, scenarioResponse: MFA_TEST_SCENARIO_RESPONSE, authenticationMethod: MFA_TEST_AUTH_METHOD});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.SUCCESS}})).toBe(true);
        expect(snapshotToState(result).isAuthorizing).toBe(true);
        expect(snapshotToState(result).isProcessingPrompt).toBe(true);

        actor.stop();
    });

    it('keeps the prompt marked as authorizing after authorization fails', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});
        const failureError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.CANCELED, 'Presentation phase spec authorization failure');

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});
        sendAuthorizeDone(actor, {success: false, error: failureError});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(snapshotToState(result).isAuthorizing).toBe(true);
        expect(snapshotToState(result).isProcessingPrompt).toBe(true);

        actor.stop();
    });

    it('keeps the prompt marked as processing, but not authorizing, after credential creation itself fails', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}}, {registrationChallenge: MFA_TEST_REGISTRATION_CHALLENGE});
        const failureError = createLocalMFAError(REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED, 'Presentation phase spec credential-creation failure');

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});
        sendCreateCredentialDone(actor, {success: false, error: failureError});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        // The prompt was never actually authorizing on this path, so its copy must stay on the
        // registration wording rather than picking up the authorization one on the way out.
        expect(snapshotToState(result).isAuthorizing).toBe(false);
        expect(snapshotToState(result).isProcessingPrompt).toBe(true);

        actor.stop();
    });

    it('keeps the prompt marked as authorizing while the modal closes', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}});

        actor.start();
        actor.send({type: 'SOFT_PROMPT_APPROVED'});
        expect(snapshotToState(actor.getSnapshot()).isProcessingPrompt).toBe(true);

        actor.send({type: 'CLOSE_MODAL'});

        const result = actor.getSnapshot();
        expect(result.matches(MFA_STATE.CLOSING)).toBe(true);
        expect(result.context.promptPresentationPhase).toBe(MFA_STATE.AUTHORIZING);
        expect(snapshotToState(result).isAuthorizing).toBe(true);
        expect(snapshotToState(result).isProcessingPrompt).toBe(true);

        actor.stop();
    });

    it('keeps the validate-code form marked submitting after the registration challenge succeeds into the prompt', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        sendRequestRegistrationChallengeDone(actor, {success: true, challenge: MFA_TEST_REGISTRATION_CHALLENGE});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.PROMPT]: MFA_STATE.AWAITING_SOFT_PROMPT}})).toBe(true);
        expect(snapshotToState(result).isValidateCodeFormSubmitting).toBe(true);

        actor.stop();
    });

    it('keeps the validate-code form marked submitting after the registration challenge fails fatally', () => {
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.VALIDATE_CODE]: MFA_STATE.AWAITING_VALIDATE_CODE}});
        const failureError = createLocalMFAError(REASON.SERVER_ERRORS.UNRECOGNIZED, 'Presentation phase spec registration challenge failure');

        actor.start();
        actor.send({type: 'VALIDATE_CODE_ENTERED', validateCode: MFA_TEST_VALIDATE_CODE});
        sendRequestRegistrationChallengeDone(actor, {success: false, error: failureError});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(snapshotToState(result).isValidateCodeFormSubmitting).toBe(true);

        actor.stop();
    });

    it('clears both frozen presentations once the modal fully closes', () => {
        const actor = createActorAtState(MFA_STATE.CLOSING, {promptPresentationPhase: MFA_STATE.AUTHORIZING, validateCodePresentationPhase: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE});

        actor.start();
        actor.send({type: 'MODAL_CLOSED'});

        const result = actor.getSnapshot();
        expect(result.matches(MFA_STATE.CLOSED)).toBe(true);
        expect(result.context.promptPresentationPhase).toBeUndefined();
        expect(result.context.validateCodePresentationPhase).toBeUndefined();

        actor.stop();
    });
});
