import type {EmptyObject, ValueOf} from 'type-fest';
import type {AllMultifactorAuthenticationNotificationType} from '@components/MultifactorAuthentication/config/types';
import type {SignedChallenge} from './ED25519/types';
import type {SECURE_STORE_VALUES} from './SecureStore';
import type VALUES from './VALUES';

type BasicMultifactorAuthenticationRequirementTypes = {
    [VALUES.FACTORS.SIGNED_CHALLENGE]: SignedChallenge;
    [VALUES.FACTORS.VALIDATE_CODE]: number;
};

type MultifactorAuthenticationPartialStatusConditional<OmitStep> = OmitStep extends false
    ? {
          /** The status of the multifactorial authentication operation */
          step: MultifactorAuthenticationStep;
      }
    : EmptyObject;

type MultifactorAuthenticationTrigger = ValueOf<typeof VALUES.TRIGGER>;

type MultifactorAuthenticationTriggerArgument = {
    [VALUES.TRIGGER.FAILURE]: AllMultifactorAuthenticationNotificationType;
    [VALUES.TRIGGER.FULFILL]: AllMultifactorAuthenticationNotificationType;
};

type MultifactorAuthenticationReason = ValueOf<{
    [K in keyof typeof VALUES.REASON]: ValueOf<(typeof VALUES.REASON)[K]>;
}>;

/**
 * Represents the core status information for multifactorial authentication operations.
 * @template T - The type of the value of the multifactorial authentication operation.
 * @template OmitStep - Whether to omit the step from the partial status.
 */
type MultifactorAuthenticationPartialStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatusConditional<OmitStep> & {
    /**
     * The result value of the multifactorial authentication operation.
     * Can be of various types depending on the operation, commonly boolean or string.
     */
    value: T;

    /**
     * Translation key explaining the current status or error condition.
     * Used to provide user feedback about what happened.
     */
    reason: MultifactorAuthenticationReason;

    /**
     * The numeric authentication type identifier from SecureStore.
     * Indicates which authentication method was used (e.g. multifactorial authentication, passcode).
     */
    type?: ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['CODE'];
};

/**
 * Complete status object for multifactorial authentication operations, extending the partial status.
 * Used to track and communicate the full state of multifactorial authentication/authorization,
 * including user-facing messages and authentication details.
 */
type MultifactorAuthenticationStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatus<T, OmitStep> & {
    /** Human-readable name of the authentication method used */
    typeName?: string;

    /**
     * Concise status message suitable for headers or brief notifications
     * Examples: "Authorization Successful", "Authentication Failed"
     */
    headerTitle: string;

    /**
     * Formatted message combining status, reason, and authentication type
     * for displaying detailed feedback to users
     */
    title: string;

    description: string;
};

type Simplify<T> = T extends Record<string, unknown> ? {[K in keyof T]: Simplify<T[K]>} : T;

/**
 * Represents a specific multifactorial authentication factor from the constants
 */
type MultifactorAuthenticationFactor = ValueOf<typeof VALUES.FACTORS>;

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

type AllMultifactorAuthenticationFactors = Simplify<MultifactorAuthenticationFactors & MultifactorAuthorizationAdditionalFactors>;

/**
 * Represents the step of the multifactorial authentication operation.
 */
type MultifactorAuthenticationStep = {
    /** Whether the recent step was successful */
    wasRecentStepSuccessful: boolean | undefined;

    /** The required factor for the next step */
    requiredFactorForNextStep: MultifactorAuthenticationFactor | undefined;

    /** Whether the request has been fulfilled */
    isRequestFulfilled: boolean;
};

/**
 * Defines the requirements for each multifactorial authentication factor
 */
type MultifactorAuthenticationFactorsRequirements = ValueOf<typeof VALUES.FACTORS_REQUIREMENTS>;

type MultifactorAuthenticationResponseMap = typeof VALUES.API_RESPONSE_MAP;

type MultifactorAuthenticationKeyType = ValueOf<typeof VALUES.KEY_ALIASES>;

type MultifactorAuthenticationActionParams<T extends Record<string, unknown>, R extends keyof AllMultifactorAuthenticationFactors> = T & Pick<AllMultifactorAuthenticationFactors, R>;

type KeyInfoType = 'biometric' | 'public-key';

type ResponseDetails<T extends KeyInfoType> = T extends 'biometric'
    ? {
          biometric: {
              publicKey: Base64URLString;
          };
      }
    : {
          clientDataJSON: Base64URLString;
          attestationObject: Base64URLString;
      };

type MultifactorAuthenticationKeyInfo<T extends KeyInfoType> = {
    rawId: Base64URLString;
    type: T;
    response: ResponseDetails<T>;
};

type MultifactorKeyStoreOptions = {
    nativePromptTitle?: string;
};

export type {
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationStep,
    MultifactorAuthenticationResponseMap,
    MultifactorAuthenticationKeyType,
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationTrigger,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationActionParams,
    MultifactorAuthenticationTriggerArgument,
    MultifactorKeyStoreOptions,
    MultifactorAuthenticationReason,
};
