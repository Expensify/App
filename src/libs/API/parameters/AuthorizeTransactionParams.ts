import type {SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/types';

type AuthorizeTransactionParams = {
    transactionID: string;
    // this one:
    signedChallenge?: SignedChallenge; // JWT
    // or these two together:
    validateCode?: number; // validate code
    otp?: number; // 2FA / SMS OTP
};

export default AuthorizeTransactionParams;
