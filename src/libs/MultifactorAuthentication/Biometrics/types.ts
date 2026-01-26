/**
 * Type definitions for multifactor authentication biometrics operations.
 */
import type {EmptyObject, Simplify, ValueOf} from 'type-fest';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import type {OutcomePaths} from '@components/MultifactorAuthentication/types';
import type {SignedChallenge} from './ED25519/types';
import type {SECURE_STORE_VALUES} from './SecureStore';
import type VALUES from './VALUES';

/**
 * Basic authentication requirement types for signed challenge and validation code.
 */
type BasicMultifactorAuthenticationRequirementTypes = {
    [VALUES.FACTORS.SIGNED_CHALLENGE]: SignedChallenge;
    [VALUES.FACTORS.VALIDATE_CODE]: number;
};

/**
 * Represents the reason for a multifactor authentication response from the backend.
 */
type MultifactorAuthenticationReason = ValueOf<{
    [K in keyof typeof VALUES.REASON]: ValueOf<(typeof VALUES.REASON)[K]>;
}>;

type MultifactorAuthenticationMethodCode = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['CODE'];

/**
 * Conditional type for including or omitting the step field in partial status.
 */
type MultifactorAuthenticationPartialStatusConditional<OmitStep> = OmitStep extends false
    ? {
          step: MultifactorAuthenticationStep;
      }
    : EmptyObject;

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
 * Factors requirements configuration.
 */
type MultifactorAuthenticationFactorsRequirements = ValueOf<typeof VALUES.FACTORS_REQUIREMENTS>;

/**
 * Individual authentication factor types.
 */
type MultifactorAuthenticationFactor = ValueOf<typeof VALUES.FACTORS>;

/**
 * Main authentication factors excluding additional factors.
 */
type MultifactorAuthenticationFactors = {
    [K in MultifactorAuthenticationFactorsRequirements as K extends {
        origin: typeof VALUES.FACTORS_ORIGIN.ADDITIONAL;
    }
        ? never
        : K['parameter']]: BasicMultifactorAuthenticationRequirementTypes[K['id']];
};

/**
 * Maps scenarios to their additional factors
 */
type MultifactorAuthorizationAdditionalFactors = {
    [K in MultifactorAuthenticationFactorsRequirements as K extends {
        origin: typeof VALUES.FACTORS_ORIGIN.ADDITIONAL;
    }
        ? K['parameter']
        : never]?: BasicMultifactorAuthenticationRequirementTypes[K['id']];
};

/**
 * Combined type representing all possible authentication factors (required and additional).
 */
type AllMultifactorAuthenticationFactors = Simplify<MultifactorAuthenticationFactors & MultifactorAuthorizationAdditionalFactors>;

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
type MultifactorAuthenticationActionParams<T extends Record<string, unknown>, R extends keyof AllMultifactorAuthenticationFactors> = T & Pick<AllMultifactorAuthenticationFactors, R>;

/**
 * Supported key types for multifactor authentication.
 */
type KeyInfoType = 'biometric' | 'public-key';

type ResponseDetails<T extends KeyInfoType> = T extends 'biometric'
    ? {
          biometric: {
              publicKey: Base64URLString;
              /** ED25519 algorithm identifier per COSE spec: -8 */
              algorithm: -8;
          };
      }
    : {
          clientDataJSON: Base64URLString;
          attestationObject: Base64URLString;
      };

/**
 * Information about a cryptographic key including its raw ID, type, and response details.
 */
type MultifactorAuthenticationKeyInfo<T extends KeyInfoType> = {
    rawId: Base64URLString;
    type: T;
    response: ResponseDetails<T>;
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
    MultifactorAuthenticationActionParams,
    MultifactorKeyStoreOptions,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationMethodCode,
    ResponseDetails,
    ChallengeType,
};
