type SignInWithShortLivedAuthTokenParams = {
    authToken: string;
    skipReauthentication: boolean;
    authMethod?: string;
};

export default SignInWithShortLivedAuthTokenParams;
