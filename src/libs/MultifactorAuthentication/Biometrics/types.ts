/**
 * Type definitions for multifactor authentication biometrics operations.
 */
import type {ValueOf} from 'type-fest';
import type {AllMultifactorAuthenticationOutcomeType} from '@components/MultifactorAuthentication/config/types';
import type {SignedChallenge} from './ED25519/types';
import type {SECURE_STORE_VALUES} from './SecureStore';
import type VALUES from './VALUES';

type MultifactorAuthenticationMethodCode = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['CODE'];

/**
 * Authentication type name derived from secure store values.
 */
type AuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['NAME'];

type MarqetaAuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['MQ_VALUE'];

type AuthTypeInfo = {
    code: MultifactorAuthenticationMethodCode;
    name: AuthTypeName;
    mqValue: MarqetaAuthTypeName;
};

type OutcomePaths = {
    successOutcome: AllMultifactorAuthenticationOutcomeType;
    failureOutcome: AllMultifactorAuthenticationOutcomeType;
};

/**
 * Represents the reason for a multifactor authentication response from the backend.
 */
type MultifactorAuthenticationReason = ValueOf<{
    [K in keyof typeof VALUES.REASON]: ValueOf<(typeof VALUES.REASON)[K]>;
}>;

/**
 * Represents a status result of multifactor authentication keystore operation.
 * Contains the operation result value, reason message and auth type code.
 */
type MultifactorAuthenticationKeyStoreStatus<T> = {
    value: T;

    reason: MultifactorAuthenticationReason;

    type?: MultifactorAuthenticationMethodCode;
};

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
 * Identifier for different types of cryptographic keys.
 */
type MultifactorAuthenticationKeyType = ValueOf<typeof VALUES.KEY_ALIASES>;

/**
 * Parameters for a multifactor authentication action with required authentication factor.
 */
type MultifactorAuthenticationActionParams<T extends Record<string, unknown>, R extends keyof AllMultifactorAuthenticationBaseParameters> = T &
    Pick<AllMultifactorAuthenticationBaseParameters, R> & {authenticationMethod: MarqetaAuthTypeName};

type MultifactorAuthenticationKeyInfo = {
    rawId: Base64URLString;
    type: typeof VALUES.ED25519_TYPE;
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
    MultifactorAuthenticationResponseMap,
    MultifactorAuthenticationKeyType,
    AllMultifactorAuthenticationBaseParameters,
    MultifactorAuthenticationKeyStoreStatus,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationActionParams,
    MultifactorKeyStoreOptions,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationMethodCode,
    ChallengeType,
    MarqetaAuthTypeName,
    OutcomePaths,
    AuthTypeName,
    AuthTypeInfo,
};
