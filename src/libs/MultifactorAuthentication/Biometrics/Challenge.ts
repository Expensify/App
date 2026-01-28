/**
 * Manages the multifactor authentication challenge flow including requesting, signing, and sending challenges.
 */
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioAdditionalParams} from '@components/MultifactorAuthentication/config/types';
import {resetKeys} from '@components/MultifactorAuthentication/Context/helpers';
import {requestAuthenticationChallenge} from '@libs/actions/MultifactorAuthentication';
import {signToken as signTokenED25519} from './ED25519';
import type {MultifactorAuthenticationChallengeObject, SignedChallenge} from './ED25519/types';
import {isChallengeSigned, processScenario} from './helpers';
import {PrivateKeyStore, PublicKeyStore} from './KeyStore';
import {SECURE_STORE_VALUES} from './SecureStore';
import type {ChallengeType, MultifactorAuthenticationMethodCode, MultifactorAuthenticationPartialStatus, MultifactorAuthenticationReason, MultifactorKeyStoreOptions} from './types';
import VALUES from './VALUES';

/**
 * Handles the complete lifecycle of a multifactor authentication challenge for a specific scenario.
 * Manages requesting challenges from the server, signing them with the private key, and sending signed challenges back.
 */
class MultifactorAuthenticationChallenge<T extends MultifactorAuthenticationScenario> {
    private challenge: MultifactorAuthenticationChallengeObject | SignedChallenge | undefined = undefined;

    private authenticationMethodCode: MultifactorAuthenticationMethodCode | undefined = undefined;

    private publicKeys: string[] = [];

    constructor(
        private readonly scenario: T,
        private readonly params: MultifactorAuthenticationScenarioAdditionalParams<T>,
        private readonly options: MultifactorKeyStoreOptions<typeof VALUES.KEY_ALIASES.PRIVATE_KEY>,
        private readonly challengeType: ChallengeType = 'authentication',
    ) {}

    /**
     * Creates an error return value with the given reason.
     */
    private createErrorReturnValue(reasonKey: MultifactorAuthenticationReason): MultifactorAuthenticationPartialStatus<boolean, true> {
        return {value: false, reason: reasonKey};
    }

    /**
     * Requests a new authentication challenge from the server and stores public keys.
     */
    public async request(): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        const {challenge, publicKeys: authPublicKeys, reason: apiReason} = await requestAuthenticationChallenge(this.challengeType);
        this.publicKeys = authPublicKeys ?? [];

        const reason = apiReason === VALUES.REASON.BACKEND.UNKNOWN_RESPONSE ? VALUES.REASON.CHALLENGE.COULD_NOT_RETRIEVE_A_CHALLENGE : apiReason;

        this.challenge = challenge;

        return {reason: challenge ? VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED : reason, value: true};
    }

    /**
     * Checks if the secure store contains a public key known to the server. If so, a challenge is signed using that key.
     */
    public async sign(
        accountID: number,
        chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null, true>,
    ): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        if (!this.challenge) {
            return this.createErrorReturnValue(VALUES.REASON.CHALLENGE.CHALLENGE_MISSING);
        }

        if (isChallengeSigned(this.challenge)) {
            return this.createErrorReturnValue(VALUES.REASON.CHALLENGE.CHALLENGE_ALREADY_SIGNED);
        }

        const {value, type, reason} = chainedPrivateKeyStatus?.value ? chainedPrivateKeyStatus : await PrivateKeyStore.get(accountID, this.options);

        if (!value) {
            return this.createErrorReturnValue(reason || VALUES.REASON.KEYSTORE.KEY_MISSING);
        }

        const {value: publicKey} = await PublicKeyStore.get(accountID);

        if (!publicKey || !this.publicKeys.includes(publicKey)) {
            await resetKeys(accountID);
            return this.createErrorReturnValue(VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED);
        }

        this.challenge = signTokenED25519(this.challenge, value, publicKey);
        this.authenticationMethodCode = type;

        return {value: true, reason: VALUES.REASON.CHALLENGE.CHALLENGE_SIGNED, type};
    }

    /**
     * Sends the signed challenge to the server for the specific scenario.
     */
    public async send(): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        const marqetaAuthType = Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === this.authenticationMethodCode)?.MQ_VALUE;

        if (!this.challenge || !isChallengeSigned(this.challenge) || marqetaAuthType === undefined) {
            return this.createErrorReturnValue(VALUES.REASON.GENERIC.SIGNATURE_MISSING);
        }

        const authorizationResult = processScenario(this.scenario, {
            ...this.params,
            signedChallenge: this.challenge,
            authenticationMethod: marqetaAuthType,
        });

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
            type: this.authenticationMethodCode,
        };
    }
}

export default MultifactorAuthenticationChallenge;
