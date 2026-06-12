import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioConfig,
} from '@components/MultifactorAuthentication/config/types';

type ScenarioPayload = MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined;

/**
 * The modal lifecycle as seen by the view layer, derived 1:1 from the machine's top-level state:
 * `open` -> 'open', `closing` -> 'closing', `idle` -> 'closed'.
 */
type MfaModalPhase = 'open' | 'closing' | 'closed';

/**
 * Events accepted by the machine. So far only the three that drive the
 * `idle -> success -> teardown` lifecycle exist; semantic input events (validate code, soft prompt, ...) are
 * added by the slices that introduce their states.
 *
 * CLOSE_MODAL requests the close (flow -> `closing`); MODAL_CLOSED is the navigator's notification
 * that the close animation fully finished (`closing` -> `idle`, which wipes the context).
 */
type MfaEvent =
    | {type: 'INIT'; scenarioName: MultifactorAuthenticationScenario; scenario: MultifactorAuthenticationScenarioConfig; payload: ScenarioPayload}
    | {type: 'CLOSE_MODAL'}
    | {type: 'MODAL_CLOSED'};

export type {MfaEvent, MfaModalPhase};
