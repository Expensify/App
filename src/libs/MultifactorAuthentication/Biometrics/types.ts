/**
 * Type definitions for multifactor authentication biometrics operations.
 */
import type {EmptyObject, ValueOf} from 'type-fest';
import type {AllMultifactorAuthenticationOutcomeType, MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import type {SignedChallenge} from './ED25519/types';
import type {SECURE_STORE_VALUES} from './SecureStore';
import type VALUES from './VALUES';

type MultifactorAuthenticationMethodCode = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['CODE'];

/**
 * Authentication type name derived from secure store values.
 */
type AuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['NAME'];

type MarqetaAuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['MQ_VALUE'];

type OutcomePaths = {
    successOutcome: AllMultifactorAuthenticationOutcomeType;
    failureOutcome: AllMultifactorAuthenticationOutcomeType;
};

/**
 * Conditional type for including or omitting the step field in partial status.
 */
type MultifactorAuthenticationPartialStatusConditional<OmitStep> = OmitStep extends false
    ? {
          step: MultifactorAuthenticationStep;
      }
    : EmptyObject;

/**
 * Represents the reason for a multifactor authentication response from the backend.
 */
type MultifactorAuthenticationReason = ValueOf<{
    [K in keyof typeof VALUES.REASON]: ValueOf<(typeof VALUES.REASON)[K]>;
}>;

/**
 * Represents a partial status result of multifactor authentication operations.
 * Contains the operation result value, reason message, and optionally the authentication step state.
 */
type MultifactorAuthenticationPartialStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatusConditional<OmitStep> & {
    value: T;

    reason: MultifactorAuthenticationReason;

    type?: MultifactorAuthenticationMethodCode;
};

type MultifactorAuthenticationStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatus<T, OmitStep> & {
    typeName?: string;

    headerTitle: string;

    title: string;

    description: string;

    scenario: MultifactorAuthenticationScenario | undefined;

    outcomePaths: OutcomePaths;
};

/**
 * Individual authentication factor types.
 */
type MultifactorAuthenticationFactor = ValueOf<typeof VALUES.FACTORS>;

/**
 * Combined type representing all possible authentication factors (required and additional).
 */
type AllMultifactorAuthenticationFactors = {
    signedChallenge: SignedChallenge;
    validateCode?: number | undefined;
};

/**
 * Represents the state of a step in the multifactor authentication flow.
 */
type MultifactorAuthenticationStep = {
    wasRecentStepSuccessful: boolean | undefined;

    requiredFactorForNextStep: MultifactorAuthenticationFactor | undefined;

    isRequestFulfilled: boolean;
};

/**
 * Maps API endpoints to their HTTP status codes and reason messages.
 */
type MultifactorAuthenticationResponseMap = typeof VALUES.API_RESPONSE_MAP;

/**
 * Identifier for different types of cryptographic keys.
 */
type MultifactorAuthenticationKeyType = ValueOf<typeof VALUES.KEY_ALIASES>;

/**
 * Parameters for a multifactor authentication action with required authentication factor.
 */
type MultifactorAuthenticationActionParams<T extends Record<string, unknown>, R extends keyof AllMultifactorAuthenticationFactors> = T &
    Pick<AllMultifactorAuthenticationFactors, R> & {authenticationMethod: MarqetaAuthTypeName};

type MultifactorAuthenticationKeyInfo = {
    rawId: Base64URLString;
    type: 'biometric';
    response: {
        clientDataJSON: Base64URLString;
        biometric: {
            publicKey: Base64URLString;
            algorithm: -8;
        };
    };
};

/**
 * Configuration options for multifactor key store operations.
 */
type MultifactorKeyStoreOptions<T extends MultifactorAuthenticationKeyType> = T extends typeof VALUES.KEY_ALIASES.PRIVATE_KEY
    ? {
          nativePromptTitle: string;
      }
    : void;

type ChallengeType = ValueOf<typeof VALUES.CHALLENGE_TYPE>;

export type {
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationStep,
    MultifactorAuthenticationResponseMap,
    MultifactorAuthenticationKeyType,
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationActionParams,
    MultifactorKeyStoreOptions,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationMethodCode,
    ChallengeType,
    MarqetaAuthTypeName,
    OutcomePaths,
    AuthTypeName,
};
