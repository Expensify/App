import type * as OnyxCommon from './OnyxCommon';

type WalletTerms = {
    /** Any error message to show */
    errors?: OnyxCommon.Errors;

    /** When the user accepts the Wallet's terms in order to pay an IOU, this is the ID of the chatReport the IOU is linked to */
    chatReportID?: string;

    /** Source that triggered the KYC wall */
    source?: string;

    /** Loading state to provide feedback when we are waiting for a request to finish */
    isLoading?: boolean;
};

export default WalletTerms;
