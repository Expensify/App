type BeginGoogleSignInParams = {
    token: string | null;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
};

export default BeginGoogleSignInParams;
