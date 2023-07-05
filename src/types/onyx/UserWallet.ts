import {ValueOf} from 'type-fest';
import CONST from '../../CONST';

type UserWallet = {
    /** The user's available wallet balance */
    availableBalance?: number;

    /** The user's current wallet balance */
    currentBalance?: number;

    /** What step in the activation flow are we on? */
    currentStep?: ValueOf<typeof CONST.WALLET.STEP>;

    /** Error code returned by the server */
    errorCode?: string;

    /** If we should show the FailedKYC view after the user submitted their info with a non fixable error */
    shouldShowFailedKYC?: boolean;

    /** Status of wallet - e.g. SILVER or GOLD */
    tierName?: ValueOf<typeof CONST.WALLET.TIER_NAME>;

    /** Whether we should show the ActivateStep success view after the user finished the KYC flow */
    shouldShowWalletActivationSuccess?: boolean;

    /** The ID of the linked account */
    walletLinkedAccountID?: number;

    /** The type of the linked account (debitCard or bankAccount) */
    walletLinkedAccountType?: string;
};

export default UserWallet;
