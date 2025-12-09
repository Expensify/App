import type {SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';

type AuthorizeTransactionParams = {
    transactionID: string;
    signedChallenge: SignedChallenge;
};

export default AuthorizeTransactionParams;
