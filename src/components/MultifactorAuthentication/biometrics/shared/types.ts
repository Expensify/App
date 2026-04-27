import type {ValueOf} from 'type-fest';
import type {AuthenticationChallenge, RegistrationChallenge, SignedChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo, MultifactorAuthenticationReason, RegistrationKeyInfo} from '@libs/MultifactorAuthentication/shared/types';
import type CONST from '@src/CONST';

type BaseRegisterResult = {
    keyInfo: RegistrationKeyInfo;
};

type RegisterResult =
    | ({
          success: true;
      } & BaseRegisterResult)
    | ({
          success: false;
          error: MFAError;
      } & Partial<BaseRegisterResult>);

type AuthorizeParams = {
    challenge: AuthenticationChallenge;
};

type AuthorizeResultSuccess = {
    success: true;
    signedChallenge: SignedChallenge;
    authenticationMethod: AuthTypeInfo;
};

type AuthorizeResultFailure = {
    success: false;
    error: MFAError;
};

type AuthorizeResult = AuthorizeResultSuccess | AuthorizeResultFailure;

type UseBiometricsReturn = {
    /** The authentication method type provided by this hook (BIOMETRICS on native, PASSKEYS on web) */
    deviceVerificationType: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>;

    /** List of credential IDs known to server (from Onyx) */
    serverKnownCredentialIDs: string[];

    /** Whether biometric credentials have ever been configured for this account */
    haveCredentialsEverBeenConfigured: boolean;

    /** Retrieve the credential ID stored locally on this device */
    getLocalCredentialID: () => Promise<string | undefined>;

    /** Check if device supports the authentication method */
    doesDeviceSupportAuthenticationMethod: () => Promise<boolean>;

    /** Reason to use when doesDeviceSupportAuthenticationMethod() returns false (platform-specific) */
    deviceCheckFailureReason: MultifactorAuthenticationReason;

    /** Check if device has biometric credentials stored locally */
    hasLocalCredentials: () => Promise<boolean>;

    /** Check if local credentials are known to server (local credential exists in server's list) */
    areLocalCredentialsKnownToServer: () => Promise<boolean>;

    /** Register current device for the chosen authentication method */
    register: (onResult: (result: RegisterResult) => Promise<void> | void, registrationChallenge: RegistrationChallenge) => Promise<void>;

    /** Authorize using chosen authentication method */
    authorize: (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => Promise<void>;

    /** Delete local keys for account */
    deleteLocalKeysForAccount: () => Promise<void>;
};

export type {BaseRegisterResult, RegisterResult, AuthorizeParams, AuthorizeResultSuccess, AuthorizeResultFailure, AuthorizeResult, UseBiometricsReturn};
