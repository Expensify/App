type WalletTerms = {
    /** Any error message to show */
    errors?: string[];

    /** When the user accepts the Wallet's terms in order to pay an IOU, this is the ID of the chatReport the IOU is linked to */
    chatReportID?: string;
};

export default WalletTerms;
