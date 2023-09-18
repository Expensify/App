import {ValueOf} from 'type-fest';
import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type WalletLinkedAccountType = 'debitCard' | 'bankAccount';

type ErrorCode = 'ssnError' | 'kbaNeeded' | 'kycFailed';

type UserWallet = {
    /** The user's available wallet balance */
    availableBalance: number;

    /** The user's current wallet balance */
    currentBalance: number;

    /** What step in the activation flow are we on? */
    currentStep: ValueOf<typeof CONST.WALLET.STEP>;

    /** If we should show the FailedKYC view after the user submitted their info with a non fixable error */
    shouldShowFailedKYC?: boolean;

    /** Status of wallet - e.g. SILVER or GOLD */
    tierName: ValueOf<typeof CONST.WALLET.TIER_NAME>;

    /** The user's wallet tier */
    tier?: number;

    /** Whether we should show the ActivateStep success view after the user finished the KYC flow */
    shouldShowWalletActivationSuccess?: boolean;

    /** The ID of the linked account */
    walletLinkedAccountID: number;

    /** The type of the linked account (debitCard or bankAccount) */
    walletLinkedAccountType: WalletLinkedAccountType;

    /** The user's bank account ID */
    bankAccountID?: number;

    /** The user's current wallet limit */
    walletLimit?: number;

    /** The user's current wallet limit enforcement period */
    walletLimitEnforcementPeriod?: number;

    /** Error code returned by the server */
    errorCode?: ErrorCode;

    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;
};

export default UserWallet;
