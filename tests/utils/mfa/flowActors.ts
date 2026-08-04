import type {MfaActorOutput} from '@components/MultifactorAuthentication/machine/machineEvents';
import mfaMachine from '@components/MultifactorAuthentication/machine/mfaMachine';
import type {MfaContext} from '@components/MultifactorAuthentication/machine/types';

import type {StateValue} from 'xstate';

import {createActor} from 'xstate';

import createInitEvent from './flowFixtures';
import {createActorDoneEvent, mfaMachineWithLifecycleEvents} from './flowPaths';

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
        hasEverAcceptedSoftPrompt: initEvent.hasEverAcceptedSoftPrompt,
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
    return createActor(mfaMachineWithLifecycleEvents, {snapshot});
}

/**
 * Completes the invoked device-check actor by sending its done event carrying the given output.
 */
function sendValidateDeviceDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'validateDevice'>) {
    actor.send(createActorDoneEvent('validateDevice', output));
}

/**
 * Completes the invoked credentials-check actor by sending its done event carrying the given output.
 */
function sendCheckLocalCredentialsDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'checkLocalCredentials'>) {
    actor.send(createActorDoneEvent('checkLocalCredentials', output));
}

/**
 * Completes the invoked credential-creation actor by sending its done event carrying the given output.
 */
function sendCreateCredentialDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'createCredential'>) {
    actor.send(createActorDoneEvent('createCredential', output));
}

export {createActorAtState, createFlowContext, sendCheckLocalCredentialsDone, sendCreateCredentialDone, sendValidateDeviceDone};
