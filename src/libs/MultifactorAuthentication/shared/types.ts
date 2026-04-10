/**
 * Shared type definitions for multifactor authentication operations.
 * Technology-agnostic types used across NativeBiometricsHSM and Passkeys.
 */
import type {ValueOf} from 'type-fest';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioAdditionalParams} from '@components/MultifactorAuthentication/config/types';
import type NativeBiometricsHSMKeyInfo from '@libs/MultifactorAuthentication/NativeBiometricsHSM/types';
import type NATIVE_BIOMETRICS_HSM_VALUES from '@libs/MultifactorAuthentication/NativeBiometricsHSM/VALUES';
import type {PasskeyRegistrationKeyInfo} from '@libs/MultifactorAuthentication/Passkeys/types';
import type {PASSKEY_AUTH_TYPE} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import type {SignedChallenge} from './challengeTypes';
import type VALUES from './VALUES';

/**
 * Authentication type name derived from react-native-biometrics values and passkey auth type.
 */
type AuthTypeName = ValueOf<typeof NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE>['NAME'] | (typeof PASSKEY_AUTH_TYPE)['NAME'];

type MarqetaAuthTypeName = ValueOf<typeof NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE>['MARQETA_VALUE'] | (typeof PASSKEY_AUTH_TYPE)['MARQETA_VALUE'];

type AuthTypeInfo = {
    code?: MultifactorAuthenticationMethodCode;
    name: AuthTypeName;
    marqetaValue: MarqetaAuthTypeName;
};

type MultifactorAuthenticationMethodCode = ValueOf<typeof NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE>['CODE'];

/**
 * Represents the reason for a multifactor authentication response from the backend.
 */
type MultifactorAuthenticationReason = ValueOf<{
    [K in keyof typeof VALUES.REASON]: ValueOf<(typeof VALUES.REASON)[K]>;
}>;

/**
 * Combined type representing all possible authentication base parameters.
 */
type AllMultifactorAuthenticationBaseParameters = {
    signedChallenge: SignedChallenge;
    validateCode?: string | undefined;
};

/**
 * Maps API endpoints to their HTTP status codes and reason messages.
 */
type MultifactorAuthenticationResponseMap = typeof VALUES.API_RESPONSE_MAP;

/**
 * Parameters for a multifactor authentication action with required authentication factor.
 */
type MultifactorAuthenticationActionParams<T extends Record<string, unknown>, R extends keyof AllMultifactorAuthenticationBaseParameters> = T &
    Pick<AllMultifactorAuthenticationBaseParameters, R> & {authenticationMethod: MarqetaAuthTypeName};

type RegistrationKeyInfo = NativeBiometricsHSMKeyInfo | PasskeyRegistrationKeyInfo;

type ChallengeType = ValueOf<typeof VALUES.CHALLENGE_TYPE>;

/**
 * Response type that determines what the MultifactorAuthenticationContext should do
 * after a scenario callback is executed.
 */
type MultifactorAuthenticationCallbackResponse = ValueOf<typeof VALUES.CALLBACK_RESPONSE>;

/**
 * Input provided to the scenario callback containing information about the final API call.
 */
type MultifactorAuthenticationCallbackInput = {
    /** The HTTP status code of the API response, if applicable */
    httpStatusCode: number | undefined;

    /** The HTTP status message or a pre-defined reason if the error occurred on the front-end */
    message?: string;

    /** Object containing the data that is relevant to the Scenario (e.g., {pin: number} for PIN scenarios) */
    body?: Record<string, unknown>;
};

/**
 * Callback function type for multifactor authentication scenarios.
 * Called after the API call completes (success or failure).
 * Returns a response that determines whether to show the outcome screen.
 */
type MultifactorAuthenticationScenarioCallback = (
    isSuccessful: boolean,
    callbackInput: MultifactorAuthenticationCallbackInput,
    payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined,
) => Promise<MultifactorAuthenticationCallbackResponse>;

export type {
    MultifactorAuthenticationResponseMap,
    AllMultifactorAuthenticationBaseParameters,
    MultifactorAuthenticationActionParams,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationMethodCode,
    ChallengeType,
    MarqetaAuthTypeName,
    AuthTypeName,
    AuthTypeInfo,
    MultifactorAuthenticationCallbackResponse,
    MultifactorAuthenticationCallbackInput,
    MultifactorAuthenticationScenarioCallback,
    RegistrationKeyInfo,
};
