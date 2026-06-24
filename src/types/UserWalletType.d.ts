type UserWalletType = {
    /** The user's available wallet balance */
    availableBalance: number;

    /** The user's current wallet balance */
    currentBalance: number;

    /** What step in the activation flow are we on? */
    currentStep: string;

    /** Error code returned by the server */
    errorCode: string;

    /** If we should show the FailedKYC view after the user submitted their info with a non fixable error */
    shouldShowFailedKYC: boolean;

    /** Status of wallet - e.g. SILVER or GOLD */
    tierName: string;

    /** Whether we should show the ActivateStep success view after the user finished the KYC flow */
    shouldShowWalletActivationSuccess: boolean;

    /** The ID of the linked account */
    walletLinkedAccountID: number;

    /** The type of the linked account (debitCard or bankAccount) */
    walletLinkedAccountType: string;
};

export default UserWalletType;
