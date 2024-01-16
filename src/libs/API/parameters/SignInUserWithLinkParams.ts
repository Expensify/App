type SignInUserWithLinkParams = {
    accountID: number;
    validateCode?: string;
    twoFactorAuthCode?: string;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
    deviceInfo: string;
};

export default SignInUserWithLinkParams;
