import type {EmptyObject, Simplify, ValueOf} from 'type-fest';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import type {NotificationPaths} from '@components/MultifactorAuthentication/types';
import type {SignedChallenge} from './ED25519/types';
import type {SECURE_STORE_VALUES} from './SecureStore';
import type VALUES from './VALUES';

type BasicMultifactorAuthenticationRequirementTypes = {
    [VALUES.FACTORS.SIGNED_CHALLENGE]: SignedChallenge;
    [VALUES.FACTORS.VALIDATE_CODE]: number;
};

type MultifactorAuthenticationPartialStatusConditional<OmitStep> = OmitStep extends false
    ? {
          step: MultifactorAuthenticationStep;
      }
    : EmptyObject;

type MultifactorAuthenticationReason = ValueOf<{
    [K in keyof typeof VALUES.REASON]: ValueOf<(typeof VALUES.REASON)[K]>;
}>;

type MultifactorAuthenticationPartialStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatusConditional<OmitStep> & {
    value: T;

    reason: MultifactorAuthenticationReason;

    type?: ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['CODE'];
};

type MultifactorAuthenticationStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatus<T, OmitStep> & {
    typeName?: string;

    headerTitle: string;

    title: string;

    description: string;

    scenario: MultifactorAuthenticationScenario | undefined;

    notificationPaths: NotificationPaths;
};

type MultifactorAuthenticationFactorsRequirements = ValueOf<typeof VALUES.FACTORS_REQUIREMENTS>;

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

type MultifactorAuthenticationStep = {
    wasRecentStepSuccessful: boolean | undefined;

    requiredFactorForNextStep: MultifactorAuthenticationFactor | undefined;

    isRequestFulfilled: boolean;
};

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
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationActionParams,
    MultifactorKeyStoreOptions,
    MultifactorAuthenticationReason,
};
