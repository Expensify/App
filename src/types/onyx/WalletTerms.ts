import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import * as OnyxCommon from './OnyxCommon';

type WalletTerms = {
    /** Any error message to show */
    errors?: OnyxCommon.Errors;

    /** When the user accepts the Wallet's terms in order to pay an IOU, this is the ID of the chatReport the IOU is linked to */
    chatReportID?: string;

    /** The source that triggered the KYC wall */
    source?: ValueOf<typeof CONST.KYC_WALL_SOURCE>;
};

export default WalletTerms;
