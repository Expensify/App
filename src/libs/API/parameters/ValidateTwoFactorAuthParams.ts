type ValidateTwoFactorAuthParams = {
    twoFactorAuthCode: string;

    /** Security code emailed to the account, which proves the person turning on 2FA also controls the account's email */
    validateCode?: string;
};

export default ValidateTwoFactorAuthParams;
