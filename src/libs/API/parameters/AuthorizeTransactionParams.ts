type AuthorizeTransactionParams = {
    transactionID: string;
    // this one:
    signedChallenge?: string; // JWT
    // or these two together:
    validateCode?: number; // validate code
    otp?: number; // 2FA / SMS OTP
};

export default AuthorizeTransactionParams;
