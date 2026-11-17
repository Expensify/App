type ValidateTwoFactorAuthParams = {
    twoFactorAuthCode: string;

    /** Magic code emailed to the account, which proves the person turning on 2FA also controls the account's email */
    validateCode?: string;
};

export default ValidateTwoFactorAuthParams;
