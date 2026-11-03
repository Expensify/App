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
        runScenarioAction: initEvent.runScenarioAction,
        validateCode: undefined,
        registrationChallenge: undefined,
        registrationKeyInfo: undefined,
        softPromptApproved: false,
        authenticationMethod: undefined,
        signedChallenge: undefined,
        scenarioResponse: undefined,
        promptPresentationPhase: undefined,
        validateCodePresentationPhase: undefined,
        registrationStateAtStart: initEvent.registrationStateAtStart,
        isRegistrationComplete: false,
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
 * Completes the invoked credentials-check actor by sending its done event carrying the given output.
 */
function sendLoadRegistrationStateDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'loadRegistrationState'>) {
    actor.send(createActorDoneEvent('loadRegistrationState', output));
}

/**
 * Completes the invoked registration-challenge actor by sending its done event carrying the given output.
 */
function sendRequestRegistrationChallengeDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'requestRegistrationChallenge'>) {
    actor.send(createActorDoneEvent('requestRegistrationChallenge', output));
}

/**
 * Completes the invoked credential-creation actor by sending its done event carrying the given output.
 */
function sendCreateCredentialDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'createCredential'>) {
    actor.send(createActorDoneEvent('createCredential', output));
}

/**
 * Completes the invoked backend-registration actor by sending its done event carrying the given output.
 */
function sendRegisterCredentialDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'registerCredential'>) {
    actor.send(createActorDoneEvent('registerCredential', output));
}

/**
 * Completes the invoked authorization actor by sending its done event carrying the given output.
 */
function sendAuthorizeDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'authorize'>) {
    actor.send(createActorDoneEvent('authorize', output));
}

/**
 * Completes the invoked scenario-action actor by sending its done event carrying the given output.
 */
function sendExecuteScenarioActionDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'executeScenarioAction'>) {
    actor.send(createActorDoneEvent('executeScenarioAction', output));
}

/**
 * Completes the invoked finalize-outcome actor by sending its done event carrying the given output.
 */
function sendFinalizeOutcomeDone(actor: ReturnType<typeof createActorAtState>, output: MfaActorOutput<'finalizeOutcome'>) {
    actor.send(createActorDoneEvent('finalizeOutcome', output));
}

export {
    createActorAtState,
    createFlowContext,
    sendAuthorizeDone,
    sendCreateCredentialDone,
    sendRegisterCredentialDone,
    sendExecuteScenarioActionDone,
    sendFinalizeOutcomeDone,
    sendLoadRegistrationStateDone,
    sendRequestRegistrationChallengeDone,
};
