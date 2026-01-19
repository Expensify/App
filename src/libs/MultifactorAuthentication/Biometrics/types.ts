/**
 * Type definitions for multifactor authentication biometrics operations.
 */
import type {Simplify, ValueOf} from 'type-fest';
import type {SignedChallenge} from './ED25519/types';
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

/**
 * Factors requirements configuration.
 */
type MultifactorAuthenticationFactorsRequirements = ValueOf<typeof VALUES.FACTORS_REQUIREMENTS>;

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

type AllMultifactorAuthenticationFactors = Simplify<MultifactorAuthenticationFactors & MultifactorAuthorizationAdditionalFactors>;

type MultifactorAuthenticationResponseMap = typeof VALUES.API_RESPONSE_MAP;

type MultifactorAuthenticationActionParams<T extends Record<string, unknown>, R extends keyof AllMultifactorAuthenticationFactors> = T & Pick<AllMultifactorAuthenticationFactors, R>;

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

type MultifactorAuthenticationKeyInfo<T extends KeyInfoType> = {
    rawId: Base64URLString;
    type: T;
    response: ResponseDetails<T>;
};

type ChallengeType = ValueOf<typeof VALUES.CHALLENGE_TYPE>;

export type {
    MultifactorAuthenticationResponseMap,
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationActionParams,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationKeyInfo,
    ResponseDetails,
    ChallengeType,
};
