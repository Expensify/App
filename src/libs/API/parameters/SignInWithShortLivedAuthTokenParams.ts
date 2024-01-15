type SignInWithShortLivedAuthTokenParams = {
    authToken: string;
    oldPartnerUserID: string;
    skipReauthentication: boolean;
};

export default SignInWithShortLivedAuthTokenParams;
