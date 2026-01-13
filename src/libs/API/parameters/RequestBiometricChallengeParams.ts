import type {ChallengeType} from '@libs/MultifactorAuthentication/Biometrics/types';

type RequestBiometricChallengeParams = {
    /** Challenge type: 'authentication' for signing existing keys, 'registration' for new key registration */
    challengeType: ChallengeType;
};

export default RequestBiometricChallengeParams;
