/**
 * Type definitions specific to native biometrics (ED25519 / KeyStore).
 */
import type {ValueOf} from 'type-fest';
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import type CONST from '@src/CONST';
import type {Base64URLString} from '@src/utils/Base64URL';
import type {SECURE_STORE_VALUES} from './SecureStore';
import type VALUES from './VALUES';

/**
 * Represents a status result of multifactor authentication keystore operation.
 * Contains the operation result value, reason message and auth type code.
 */
type MultifactorAuthenticationKeyStoreStatus<T> = {
    value: T;

    reason: MultifactorAuthenticationReason;

    type?: ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['CODE'];
};

/**
 * Identifier for different types of cryptographic keys.
 */
type MultifactorAuthenticationKeyType = ValueOf<typeof VALUES.KEY_ALIASES>;

/**
 * Configuration options for multifactor key store operations.
 */
type MultifactorKeyStoreOptions<T extends MultifactorAuthenticationKeyType> = T extends typeof VALUES.KEY_ALIASES.PRIVATE_KEY
    ? {
          nativePromptTitle: string;
      }
    : void;

type NativeBiometricsKeyInfo = {
    rawId: Base64URLString;
    type: typeof VALUES.ED25519_TYPE;
    response: {
        clientDataJSON: Base64URLString;
        biometric: {
            publicKey: Base64URLString;
            algorithm: typeof CONST.COSE_ALGORITHM.EDDSA;
        };
    };
};

export type {MultifactorAuthenticationKeyStoreStatus, MultifactorAuthenticationKeyType, MultifactorKeyStoreOptions, NativeBiometricsKeyInfo};
