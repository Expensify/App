import * as OnyxCommon from './OnyxCommon';

type WalletTerms = {
    /** Any error message to show */
    errors?: OnyxCommon.Errors;

    /** When the user accepts the Wallet's terms in order to pay an IOU, this is the ID of the chatReport the IOU is linked to */
    chatReportID?: string;
};

export default WalletTerms;
