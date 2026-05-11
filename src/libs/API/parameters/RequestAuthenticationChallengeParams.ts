import type {ChallengeType} from '@libs/MultifactorAuthentication/shared/types';

type RequestAuthenticationChallengeParams = {
    /** Challenge type: 'authentication' for signing existing keys, 'registration' for new key registration */
    challengeType: ChallengeType;

    /** Validate code required for registration challenge type */
    validateCode?: string;
};

export default RequestAuthenticationChallengeParams;
