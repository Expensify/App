import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Type of account linked to user's wallet */
type WalletLinkedAccountType = 'debitCard' | 'bankAccount';

/** Error code sent from the server after updating user's wallet */
type ErrorCode = 'ssnError' | 'kbaNeeded' | 'kycFailed';

/** Type of setup that the user follows to link an account to his wallet */
type SetupType = ValueOf<typeof CONST.BANK_ACCOUNT.SETUP_TYPE>;

/** Model of user wallet */
type UserWallet = {
    /** The user's available wallet balance */
    availableBalance: number;

    /** The user's current wallet balance */
    currentBalance: number;

    /** What step in the activation flow are we on? */
    currentStep: ValueOf<typeof CONST.WALLET.STEP>;

    /** If the user failed the Onfido verification check */
    hasFailedOnfido?: boolean;

    /** If we should show the FailedKYC view after the user submitted their info with a non fixable error */
    shouldShowFailedKYC?: boolean;

    /** Status of wallet - e.g. SILVER or GOLD */
    tierName: ValueOf<typeof CONST.WALLET.TIER_NAME>;

    /** The user's wallet tier */
    tier?: number;

    /** Whether the Onfido result is pending. KYC is not complete and the wallet will not be activated until we have the Onfido verification result */
    isPendingOnfidoResult?: boolean;

    /** The ID of the linked account */
    walletLinkedAccountID: number;

    /** The type of the linked account (debitCard or bankAccount) */
    walletLinkedAccountType: WalletLinkedAccountType;

    /** The wallet's programID, used to show the correct terms. */
    walletProgramID?: string;

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

    /** The type of setup for adding the bank account */
    setupType?: SetupType;
};

export default UserWallet;
