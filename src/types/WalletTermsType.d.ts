import * as CommonTypes from './common';

type WalletTermsType = CommonTypes.BaseState & {
    /** When the user accepts the Wallet's terms in order to pay an IOU, this is the ID of the chatReport the IOU is linked to */
    chatReportID: string;
};

export default WalletTermsType;
