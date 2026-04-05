type ReplaceTwoFactorDeviceParams = {
    step: 'verify_old' | 'verify_new';
    twoFactorAuthCode: string;
};

export default ReplaceTwoFactorDeviceParams;
