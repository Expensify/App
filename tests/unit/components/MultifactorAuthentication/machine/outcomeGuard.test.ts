import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import {createActorAtState, sendValidateDeviceDone} from 'tests/utils/mfa/flowActors';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

describe('MFA outcome guard', () => {
    it('routes a successful actor result to failure when the context already contains an error', () => {
        const existingError = createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'Existing flow error');
        const actor = createActorAtState({[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.VALIDATING_DEVICE}}, {error: existingError});

        actor.start();
        sendValidateDeviceDone(actor, {success: true});

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.error).toBe(existingError);

        actor.stop();
    });
});
