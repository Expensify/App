import type {EmptyObject} from 'type-fest';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import type AssertTypesEqual from '@src/types/utils/AssertTypesEqual';
import type {Payload as AuthorizeTransactionPayload} from './AuthorizeTransaction';
import type {Payload as ChangePINPayload} from './ChangePIN';
import type {SCENARIO_NAMES} from './names';
import type {Payload as RevealCardDetailsPayload} from './RevealCardDetails';
import type {Payload as RevealPINPayload} from './RevealPIN';
import type {Payload as SetPINOrderCardPayload} from './SetPINOrderCard';

/**
 * Per-scenario additional payload types, keyed by scenario name. Scenarios that take no extra
 * parameters map to {@link EmptyObject}.
 *
 * This map is the single source of truth behind {@link MultifactorAuthenticationScenarioAdditionalParams},
 * so it must list every name in {@link SCENARIO_NAMES} - the {@link AssertScenarioPayloadMapKeys} guard
 * below turns a missing or extra entry into a compile error.
 */
type ScenarioPayloadMap = {
    [SCENARIO_NAMES.BIOMETRICS_TEST]: EmptyObject;
    [SCENARIO_NAMES.SET_PIN_ORDER_CARD]: SetPINOrderCardPayload;
    [SCENARIO_NAMES.AUTHORIZE_TRANSACTION]: AuthorizeTransactionPayload;
    [SCENARIO_NAMES.REVEAL_PIN]: RevealPINPayload;
    [SCENARIO_NAMES.CHANGE_PIN]: ChangePINPayload;
    [SCENARIO_NAMES.REVEAL_CARD_DETAILS]: RevealCardDetailsPayload;
};

type ScenarioPayloadMapMismatchError =
    `Error: ScenarioPayloadMap is out of sync with the MFA scenario names - add or remove the payload entry for: ${Exclude<MultifactorAuthenticationScenario, keyof ScenarioPayloadMap>}`;

/**
 * Compile-time guard tying {@link ScenarioPayloadMap}'s keys to the scenario union. If a scenario is
 * added to or removed from {@link SCENARIO_NAMES} without the matching payload entry, this alias fails
 * to resolve instead of the lookup silently degrading to {@link EmptyObject}. It exists only for that
 * side effect - the same idiom guards the Onyx keys in `src/ONYXKEYS.ts`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertScenarioPayloadMapKeys = AssertTypesEqual<keyof ScenarioPayloadMap, MultifactorAuthenticationScenario, ScenarioPayloadMapMismatchError>;

/** Payload types for multifactor authentication scenarios, keyed by scenario name. */
type Payloads = ScenarioPayloadMap;

export type {Payloads, ScenarioPayloadMap};
