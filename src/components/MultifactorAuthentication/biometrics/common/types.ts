import type {AuthenticationChallenge, SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';

type BaseRegisterResult = {
    privateKey: string;
    publicKey: string;
    authenticationMethod: AuthTypeInfo;
};

type RegisterResult =
    | ({
          success: true;
          reason: MultifactorAuthenticationReason;
      } & BaseRegisterResult)
    | ({
          success: false;
          reason: MultifactorAuthenticationReason;
      } & Partial<BaseRegisterResult>);

type AuthorizeParams = {
    challenge: AuthenticationChallenge;
};

type AuthorizeResultSuccess = {
    success: true;
    reason: MultifactorAuthenticationReason;
    signedChallenge: SignedChallenge;
    authenticationMethod: AuthTypeInfo;
};

type AuthorizeResultFailure = {
    success: false;
    reason: MultifactorAuthenticationReason;
};

type AuthorizeResult = AuthorizeResultSuccess | AuthorizeResultFailure;

type UseBiometricsReturn = {
    /** Whether server has any registered credentials for this account */
    serverHasAnyCredentials: boolean;

    /** List of credential IDs known to server (from Onyx) */
    serverKnownCredentialIDs: string[];

    /** Check if device supports biometrics */
    doesDeviceSupportBiometrics: () => boolean;

    /** Check if device has biometric credentials stored locally */
    hasLocalCredentials: () => Promise<boolean>;

    /** Check if local credentials are known to server (local credential exists in server's list) */
    areLocalCredentialsKnownToServer: () => Promise<boolean>;

    /** Register biometrics on device */
    register: (onResult: (result: RegisterResult) => Promise<void> | void) => Promise<void>;

    /** Authorize using biometrics */
    authorize: (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => Promise<void>;

    /** Reset keys for account */
    resetKeysForAccount: () => Promise<void>;
};

export type {BaseRegisterResult, RegisterResult, AuthorizeParams, AuthorizeResultSuccess, AuthorizeResultFailure, AuthorizeResult, UseBiometricsReturn};
