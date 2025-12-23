import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioAdditionalParams} from '@components/MultifactorAuthentication/config/types';
import {resetKeys} from '@components/MultifactorAuthentication/helpers';
import {requestBiometricChallenge} from '@libs/actions/MultifactorAuthentication';
import {signToken as signTokenED25519} from './ED25519';
import type {MultifactorAuthenticationChallengeObject, SignedChallenge} from './ED25519/types';
import {isChallengeSigned, processScenario} from './helpers';
import {PrivateKeyStore, PublicKeyStore} from './KeyStore';
import type {MultifactorAuthenticationPartialStatus, MultifactorAuthenticationReason, MultifactorKeyStoreOptions} from './types';
import VALUES from './VALUES';

/**
 * Handles the multifactorial authentication challenge flow for a specific transaction.
 * Maintains state between steps to ensure transaction consistency.
 *
 * The standard authentication flow is:
 * 1. Request a challenge from the API
 * 2. Sign the challenge using multifactorial authentication
 * 3. Send the signed challenge back for verification
 *
 * Each step provides detailed status feedback through MultifactorAuthenticationPartialStatus objects.
 */
class MultifactorAuthenticationChallenge<T extends MultifactorAuthenticationScenario> {
    /** Tracks the current state and status of the authentication process */
    private auth: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationChallengeObject | SignedChallenge | undefined, true> = {
        value: undefined,
        reason: VALUES.REASON.GENERIC.NO_ACTION_MADE_YET,
    };

    private publicKeys: string[] = [];

    constructor(
        private readonly scenario: T,
        private readonly params: MultifactorAuthenticationScenarioAdditionalParams<T>,
        private readonly options?: MultifactorKeyStoreOptions,
    ) {}

    /** Creates a standardized error response with the given reason key */
    private createErrorReturnValue(reasonKey: MultifactorAuthenticationReason): MultifactorAuthenticationPartialStatus<boolean, true> {
        return {value: false, reason: reasonKey};
    }

    /**
     * Initiates the challenge process by requesting a new challenge from the API.
     * Verifies the backend is properly synced and handles the challenge response.
     */
    public async request(): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        const {challenge, publicKeys: authPublicKeys, reason: apiReason} = await requestBiometricChallenge();
        this.publicKeys = authPublicKeys ?? [];

        const reason = apiReason === VALUES.REASON.BACKEND.UNKNOWN_RESPONSE ? VALUES.REASON.CHALLENGE.BAD_TOKEN : apiReason;

        this.auth = {
            value: challenge,
            reason: challenge ? VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED : reason,
        };

        return {...this.auth, value: true};
    }

    /**
     * Signs the challenge using the private key stored in secure storage.
     * Triggers a biometric authentication prompt when accessing the private key.
     * Can reuse a previously fetched private key status to avoid multiple auth prompts.
     */
    public async sign(
        accountID: number,
        chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null, true>,
    ): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        if (!this.auth.value) {
            return this.createErrorReturnValue(VALUES.REASON.CHALLENGE.CHALLENGE_MISSING);
        }

        if (isChallengeSigned(this.auth.value)) {
            return this.createErrorReturnValue(VALUES.REASON.CHALLENGE.CHALLENGE_ALREADY_SIGNED);
        }

        const {value, type, reason} = chainedPrivateKeyStatus?.value ? chainedPrivateKeyStatus : await PrivateKeyStore.get(accountID, this.options);

        if (!value) {
            return this.createErrorReturnValue(reason || VALUES.REASON.KEYSTORE.KEY_MISSING);
        }

        const {value: publicKey} = await PublicKeyStore.get(accountID);

        if (!publicKey || !this.publicKeys.includes(publicKey)) {
            resetKeys(accountID);
            return this.createErrorReturnValue(VALUES.REASON.KEYSTORE.KEY_MISSING_ON_THE_BACKEND);
        }

        this.auth = {
            value: signTokenED25519(accountID, this.auth.value, value),
            reason: VALUES.REASON.CHALLENGE.CHALLENGE_SIGNED,
            type,
        };

        return {...this.auth, value: true};
    }

    /**
     * Sends the signed challenge to the API for verification.
     * Handles both configured and not configured device states.
     * For not configured devices or re-registration, requires a validation code.
     */
    public async send(): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        const {value} = this.auth;

        if (!value || !isChallengeSigned(value)) {
            return this.createErrorReturnValue(VALUES.REASON.GENERIC.SIGNATURE_MISSING);
        }

        const authorizationResult = processScenario(
            this.scenario,
            {
                ...this.params,
                signedChallenge: value,
            },
            VALUES.FACTOR_COMBINATIONS.BIOMETRICS_AUTHENTICATION,
        );

        const {
            reason,
            step: {wasRecentStepSuccessful, isRequestFulfilled},
        } = await authorizationResult;

        if (!wasRecentStepSuccessful || !isRequestFulfilled) {
            return this.createErrorReturnValue(reason === VALUES.REASON.BACKEND.UNKNOWN_RESPONSE ? VALUES.REASON.GENERIC.SIGNATURE_INVALID : reason);
        }

        return {
            value: true,
            reason: VALUES.REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
            type: this.auth.type,
        };
    }
}

export default MultifactorAuthenticationChallenge;
