import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioConfig,
} from '@components/MultifactorAuthentication/config/types';
import type {MultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context/state';

type ScenarioPayload = MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined;

/**
 * Machine context: the legacy {@link MultifactorAuthenticationState} minus `isModalOpen`, which is a
 * derivative of the chart (`matches('open')`) rather than stored data. `snapshotToState` maps the
 * snapshot back to the full legacy shape so consumers keep reading `state.X` unchanged.
 */
type MfaMachineContext = Omit<MultifactorAuthenticationState, 'isModalOpen'>;

/**
 * Events accepted by the machine. PR-5 (Slice 1) only needs the three that drive the
 * `idle -> success -> teardown` lifecycle; semantic input events (validate code, soft prompt, ...) are
 * added by the slices that introduce their states.
 *
 * CLOSE_MODAL requests the close (flow -> `closing`); MODAL_CLOSED is the navigator's notification
 * that the close animation fully finished (`closing` -> `idle`, which wipes the context).
 */
type MfaEvent =
    | {type: 'INIT'; scenarioName: MultifactorAuthenticationScenario; scenario: MultifactorAuthenticationScenarioConfig; payload: ScenarioPayload}
    | {type: 'CLOSE_MODAL'}
    | {type: 'MODAL_CLOSED'};

export type {MfaMachineContext, MfaEvent, ScenarioPayload};
