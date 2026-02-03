import type {ChallengeType} from '@libs/MultifactorAuthentication/Biometrics/types';

type RequestAuthenticationChallengeParams = {
    /** Challenge type: 'authentication' for signing existing keys, 'registration' for new key registration */
    challengeType: ChallengeType;
};

export default RequestAuthenticationChallengeParams;
