import type {MultifactorAuthenticationScenarioConfigFor} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import type {MultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/state';
import type CONST from '@src/CONST';

/**
 * The machine's context: the subset of {@link MultifactorAuthenticationState} actually wired into the
 * chart today - either written by an action or read off the snapshot by a consumer. Later slices add
 * fields back here as they wire them in; the full shape still lives in the Context/reducer layer for
 * its own consumers.
 */
type MfaContext = Pick<MultifactorAuthenticationState, 'error' | 'scenarioName' | 'scenario' | 'payload' | 'isCancelConfirmVisible'>;

/** Modal lifecycle state the view layer reads: the machine's three top-level states. */
type MfaModalState =
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.CLOSED
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.OPEN
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.CLOSING;

/**
 * The INIT event that starts a flow, with `scenarioName`, `scenario` config, and `payload` correlated
 * through `T`. `executeScenario` dispatches it with `T` fixed to the started scenario, so pairing a name
 * with another scenario's config or params is a compile error at the call site.
 *
 * `T` defaults to the full scenario union so the bare event (and {@link MfaEvent}) stays usable as the
 * actor's event type, where the running scenario is not known statically.
 */
type MultifactorAuthenticationInitEvent<T extends MultifactorAuthenticationScenario = MultifactorAuthenticationScenario> = {
    type: 'INIT';
    scenarioName: T;
    scenario: MultifactorAuthenticationScenarioConfigFor<T>;
    payload: MultifactorAuthenticationScenarioParams<T> | undefined;
};

/**
 * Events accepted by the machine. So far only the three that drive the
 * `closed -> success -> teardown` lifecycle exist; semantic input events (validate code, soft prompt, ...) are
 * added by the slices that introduce their states.
 *
 * CLOSE_MODAL requests the close (flow -> `closing`); MODAL_CLOSED is the navigator's notification
 * that the close animation fully finished (`closing` -> `closed`, which wipes the context).
 */
type MfaEvent = MultifactorAuthenticationInitEvent | {type: 'CLOSE_MODAL'} | {type: 'MODAL_CLOSED'};

export type {MfaContext, MfaEvent, MfaModalState, MultifactorAuthenticationInitEvent};
