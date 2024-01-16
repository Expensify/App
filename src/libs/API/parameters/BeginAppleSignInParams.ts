type BeginAppleSignInParams = {
    idToken: typeof idToken;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
};

export default BeginAppleSignInParams;
