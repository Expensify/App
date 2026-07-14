import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaEvent} from '@components/MultifactorAuthentication/machine/types';

import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import createInitEvent from 'tests/utils/mfa/flowFixtures';
import {VALIDATE_DEVICE_DONE_EVENT_TYPE} from 'tests/utils/mfa/flowPaths';
import {createActor} from 'xstate';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

describe('MFA outcome guard', () => {
    it('routes a successful actor result to failure when the context already contains an error', () => {
        const initEvent = createInitEvent();
        const existingError = createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'Existing flow error');
        const validatingDeviceSnapshot = mfaMachine.resolveState({
            value: {[MFA_STATE.OPEN]: {[MFA_STATE.PREPARING]: MFA_STATE.VALIDATING_DEVICE}},
            context: {
                error: existingError,
                scenarioName: initEvent.scenarioName,
                scenario: initEvent.scenario,
                payload: initEvent.payload,
                isCancelConfirmVisible: false,
            },
        });
        const actor = createActor(mfaMachine, {snapshot: validatingDeviceSnapshot});

        actor.start();
        // Framework actor events are not part of the application's MfaEvent union.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        actor.send({type: VALIDATE_DEVICE_DONE_EVENT_TYPE, output: {success: true}} as unknown as MfaEvent);

        const result = actor.getSnapshot();
        expect(result.matches({[MFA_STATE.OPEN]: {[MFA_STATE.OUTCOME]: MFA_STATE.FAILURE}})).toBe(true);
        expect(result.context.error).toBe(existingError);

        actor.stop();
    });
});
