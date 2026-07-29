import type createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaContext} from '@components/MultifactorAuthentication/machine/types';

import type {OutputFrom, StateValue} from 'xstate';

import {createActor} from 'xstate';

import createInitEvent from './flowFixtures';
import {CHECK_LOCAL_CREDENTIALS_DONE_EVENT_TYPE, createActorDoneEvent, VALIDATE_DEVICE_DONE_EVENT_TYPE} from './flowPaths';

type ValidateDeviceOutput = OutputFrom<ReturnType<typeof createActors>['validateDevice']>;
type CheckLocalCredentialsOutput = OutputFrom<ReturnType<typeof createActors>['checkLocalCredentials']>;

/**
 * Builds the context a flow carries right after INIT seeds it. Overrides express a spec's starting
 * variation, such as a stored error.
 */
function createFlowContext(overrides: Partial<MfaContext> = {}): MfaContext {
    const initEvent = createInitEvent();
    return {
        accountID: initEvent.accountID,
        error: undefined,
        scenarioName: initEvent.scenarioName,
        scenario: initEvent.scenario,
        payload: initEvent.payload,
        validateCode: undefined,
        registrationChallenge: undefined,
        softPromptApproved: false,
        isCancelConfirmVisible: false,
        ...overrides,
    };
}

/**
 * Creates an actor resolved to the given state value over a fresh post-INIT context, so a transition
 * spec can drive a single hop without walking the whole flow first. The actor is not started.
 */
function createActorAtState(value: StateValue, contextOverrides?: Partial<MfaContext>) {
    const snapshot = mfaMachine.resolveState({value, context: createFlowContext(contextOverrides)});
    return createActor(mfaMachine, {snapshot});
}

/**
 * Completes the invoked device-check actor by sending its done event carrying the given output.
 */
function sendValidateDeviceDone(actor: ReturnType<typeof createActorAtState>, output: ValidateDeviceOutput) {
    actor.send(createActorDoneEvent({type: VALIDATE_DEVICE_DONE_EVENT_TYPE, output}));
}

/**
 * Completes the invoked credentials-check actor by sending its done event carrying the given output.
 */
function sendCheckLocalCredentialsDone(actor: ReturnType<typeof createActorAtState>, output: CheckLocalCredentialsOutput) {
    actor.send(createActorDoneEvent({type: CHECK_LOCAL_CREDENTIALS_DONE_EVENT_TYPE, output}));
}

export {createActorAtState, createFlowContext, sendCheckLocalCredentialsDone, sendValidateDeviceDone};
