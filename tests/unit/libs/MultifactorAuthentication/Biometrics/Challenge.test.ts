import type {MultifactorAuthenticationScenarioAdditionalParams} from '@components/MultifactorAuthentication/config/types';
import * as MFAActions from '@libs/actions/MultifactorAuthentication';
import MultifactorAuthenticationChallenge from '@libs/MultifactorAuthentication/Biometrics/Challenge';
import type {MultifactorAuthenticationChallengeObject} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import * as helpers from '@libs/MultifactorAuthentication/Biometrics/helpers';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import CONST from '@src/CONST';

// Mock dependencies
jest.mock('@libs/actions/MultifactorAuthentication');
jest.mock('@libs/MultifactorAuthentication/Biometrics/ED25519');
jest.mock('@libs/MultifactorAuthentication/Biometrics/helpers');
jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');

const mockedChallengeObject: MultifactorAuthenticationChallengeObject = {
    allowCredentials: [],
    rpId: 'example.com',
    challenge: 'test-challenge',
    userVerification: 'required',
    timeout: 7000,
};

const mockHelpers = jest.mocked(helpers);
const mockPrivateKeyStore = jest.mocked(PrivateKeyStore);
const mockPublicKeyStore = jest.mocked(PublicKeyStore);
const mockMFAActions = jest.mocked(MFAActions);

describe('MultifactorAuthenticationChallenge', () => {
    const mockScenario = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST;
    const mockParams: MultifactorAuthenticationScenarioAdditionalParams<typeof mockScenario> = {};
    const mockAccountID = 12345;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize challenge instance with scenario and params', () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});
            expect(challenge).toBeDefined();
        });

        it('should accept optional keystore options', () => {
            const options = {nativePromptTitle: 'Test Prompt'};
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, options);
            expect(challenge).toBeDefined();
        });
    });

    describe('request method', () => {
        it('should successfully request a challenge from the server', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            // Mock the requestAuthenticationChallenge function
            mockMFAActions.requestAuthenticationChallenge.mockResolvedValueOnce({
                challenge: mockedChallengeObject,
                httpCode: 200,
                publicKeys: ['key1', 'key2'],
                reason: VALUES.REASON.BACKEND.CHALLENGE_GENERATED,
            });

            const result = await challenge.request();

            expect(result).toEqual({
                value: true,
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });
        });

        it('should handle bad token error', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            mockMFAActions.requestAuthenticationChallenge.mockResolvedValueOnce({
                challenge: undefined,
                publicKeys: undefined,
                httpCode: 400,
                reason: VALUES.REASON.BACKEND.UNKNOWN_RESPONSE,
            });

            const result = await challenge.request();

            expect(result.value).toBe(true);
            expect(result.reason).toBe(VALUES.REASON.CHALLENGE.COULD_NOT_RETRIEVE_A_CHALLENGE);
        });
    });

    describe('sign method', () => {
        it('should return error if challenge is not requested yet', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            const result = await challenge.sign(mockAccountID);

            expect(result.value).toBe(false);
            expect(result.reason).toBe(VALUES.REASON.CHALLENGE.CHALLENGE_MISSING);
        });

        it('should return error if challenge is already signed', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            // Mock request
            mockMFAActions.requestAuthenticationChallenge.mockResolvedValueOnce({
                challenge: mockedChallengeObject,
                publicKeys: ['key1'],
                httpCode: 200,
                reason: VALUES.REASON.BACKEND.CHALLENGE_GENERATED,
            });

            await challenge.request();

            // Mock isChallengeSigned to return true
            mockHelpers.isChallengeSigned.mockReturnValueOnce(true);

            const result = await challenge.sign(mockAccountID);

            expect(result.value).toBe(false);
            expect(result.reason).toBe(VALUES.REASON.CHALLENGE.CHALLENGE_ALREADY_SIGNED);
        });

        it('should handle missing private key', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            // Mock request
            mockMFAActions.requestAuthenticationChallenge.mockResolvedValueOnce({
                challenge: mockedChallengeObject,
                publicKeys: ['key1'],
                httpCode: 200,
                reason: VALUES.REASON.BACKEND.CHALLENGE_GENERATED,
            });

            await challenge.request();

            // Mock isChallengeSigned to return false
            mockHelpers.isChallengeSigned.mockReturnValueOnce(false);

            // Mock private key retrieval failure
            mockPrivateKeyStore.get.mockResolvedValueOnce({
                value: null,
                reason: VALUES.REASON.KEYSTORE.KEY_NOT_FOUND,
            });

            const result = await challenge.sign(mockAccountID);

            expect(result.value).toBe(false);
            expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_NOT_FOUND);
        });

        it('should delete keys if public key is missing from backend', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            // Mock request
            mockMFAActions.requestAuthenticationChallenge.mockResolvedValueOnce({
                challenge: mockedChallengeObject,
                httpCode: 200,
                publicKeys: ['backend-key'],
                reason: VALUES.REASON.BACKEND.CHALLENGE_GENERATED,
            });

            await challenge.request();

            // Mock isChallengeSigned to return false
            mockHelpers.isChallengeSigned.mockReturnValueOnce(false);

            // Mock private key retrieval success
            mockPrivateKeyStore.get.mockResolvedValueOnce({
                value: 'private-key-value',
                reason: VALUES.REASON.KEYSTORE.KEY_RETRIEVED,
            });

            // Mock public key retrieval with different key
            mockPublicKeyStore.get.mockResolvedValueOnce({
                value: 'different-key',
                reason: VALUES.REASON.KEYSTORE.KEY_RETRIEVED,
            });

            const result = await challenge.sign(mockAccountID);

            expect(result.value).toBe(false);
            expect(result.reason).toBe(VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockPrivateKeyStore.delete).toHaveBeenCalledWith(mockAccountID);
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockPublicKeyStore.delete).toHaveBeenCalledWith(mockAccountID);
        });
    });

    describe('send method', () => {
        it('should return error if challenge is not signed', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            const result = await challenge.send();

            expect(result.value).toBe(false);
            expect(result.reason).toBe(VALUES.REASON.GENERIC.SIGNATURE_MISSING);
        });

        it('should process scenario with signed challenge', async () => {
            const challenge = new MultifactorAuthenticationChallenge(mockScenario, mockParams, {nativePromptTitle: 'Test'});

            // Mock request and helpers
            mockMFAActions.requestAuthenticationChallenge.mockResolvedValueOnce({
                challenge: mockedChallengeObject,
                httpCode: 200,
                publicKeys: ['key1'],
                reason: VALUES.REASON.BACKEND.CHALLENGE_GENERATED,
            });

            mockHelpers.isChallengeSigned.mockReturnValueOnce(true);

            // Mock processScenario
            mockHelpers.processScenario.mockResolvedValueOnce({
                reason: VALUES.REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
                value: undefined,
                step: {
                    wasRecentStepSuccessful: true,
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                },
            });

            await challenge.request();

            const result = await challenge.send();

            expect(result.value).toBe(true);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.AUTHORIZATION_SUCCESSFUL);
        });
    });
});
