import {BiometricsPartialStatus} from '@hooks/useBiometricsStatus/types';
import {requestBiometricsChallenge} from '@libs/actions/Biometrics';
import {BiometricsPrivateKeyStore} from '@libs/Biometrics/BiometricsKeyStore';
import processBiometricsScenario from '@libs/Biometrics/scenarios/processBiometricsScenario';
import {signToken as signTokenED25519} from '@libs/ED25519';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

/**
 * Handles the biometric authentication challenge flow for a specific transaction.
 * Maintains state between steps to ensure transaction consistency.
 *
 * The standard authentication flow is:
 * 1. Request a challenge from the API
 * 2. Sign the challenge using biometric authentication
 * 3. Send the signed challenge back for verification
 *
 * Each step provides detailed status feedback through BiometricsPartialStatus objects.
 */
class BiometricsChallenge {
    /** Tracks the current state and status of the authentication process */
    private auth: BiometricsPartialStatus<string | undefined, true> = {
        value: undefined,
        reason: 'biometrics.reason.generic.notRequested',
    };

    constructor(private readonly transactionID: string) {}

    /** Creates a standardized error response with the given reason key */
    private createErrorReturnValue(reasonKey: TranslationPaths): BiometricsPartialStatus<boolean, true> {
        return {value: false, reason: reasonKey};
    }

    /**
     * Initiates the challenge process by requesting a new challenge from the API.
     * Verifies the backend is properly synced and handles the challenge response.
     */
    public async request(): Promise<BiometricsPartialStatus<boolean, true>> {
        const {httpCode, challenge, reason: apiReason} = await requestBiometricsChallenge();
        const syncedBE = httpCode !== 401;

        if (!syncedBE) {
            return this.createErrorReturnValue('biometrics.reason.error.keyMissingOnTheBE');
        }

        const challengeString = challenge ? JSON.stringify(challenge) : undefined;
        const reason = apiReason.endsWith('unknownResponse') ? 'biometrics.reason.error.badToken' : apiReason;

        this.auth = {
            value: challengeString,
            reason: challenge ? 'biometrics.reason.success.tokenReceived' : reason,
        };

        return {...this.auth, value: true};
    }

    /**
     * Signs the challenge using the private key stored in secure storage.
     * Triggers a biometric authentication prompt when accessing the private key.
     * Can reuse a previously fetched private key status to avoid multiple auth prompts.
     */
    public async sign(chainedPrivateKeyStatus?: BiometricsPartialStatus<string | null, true>): Promise<BiometricsPartialStatus<boolean, true>> {
        if (!this.auth.value) {
            return this.createErrorReturnValue('biometrics.reason.error.tokenMissing');
        }

        const {value, type, reason} = chainedPrivateKeyStatus?.value ? chainedPrivateKeyStatus : await BiometricsPrivateKeyStore.get();

        if (!value) {
            return this.createErrorReturnValue(reason || 'biometrics.reason.error.keyMissing');
        }

        this.auth = {
            value: signTokenED25519(this.auth.value, value),
            reason: 'biometrics.reason.success.tokenSigned',
            type,
        };

        return {...this.auth, value: true};
    }

    /**
     * Sends the signed challenge to the API for verification.
     * Handles both configured and unconfigured device states.
     * For unconfigured devices or re-registration, requires a validation code.
     */
    public async send(validateCode?: number): Promise<BiometricsPartialStatus<boolean, true>> {
        if (!this.auth.value) {
            return this.createErrorReturnValue('biometrics.reason.error.signatureMissing');
        }

        let authorizationResult;

        if (validateCode) {
            authorizationResult = processBiometricsScenario(CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE, {
                signedChallenge: this.auth.value,
                validateCode,
                transactionID: this.transactionID,
            });
        } else {
            authorizationResult = processBiometricsScenario(CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION, {
                signedChallenge: this.auth.value,
                transactionID: this.transactionID,
            });
        }

        const {
            reason,
            step: {wasRecentStepSuccessful, isRequestFulfilled},
        } = await authorizationResult;

        if (!wasRecentStepSuccessful || !isRequestFulfilled) {
            return this.createErrorReturnValue(reason.endsWith('unknownResponse') ? 'biometrics.reason.error.challengeRejected' : reason);
        }

        return {
            value: true,
            reason: 'biometrics.reason.success.verificationSuccess',
            type: this.auth.type,
        };
    }
}

export default BiometricsChallenge;
