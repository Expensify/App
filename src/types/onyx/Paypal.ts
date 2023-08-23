import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type PaypalAccountData = {
    username: string;
};

type Paypal = {
    /** This is always 'PayPal.me' */
    title: string;

    /** The paypalMe address */
    description: string;

    /** This is always 'payPalMe' */
    methodID: typeof CONST.PAYMENT_METHODS.PAYPAL;

    /** This is always 'payPalMe' */
    accountType: typeof CONST.PAYMENT_METHODS.PAYPAL;

    key: string;
    isDefault: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    accountData: PaypalAccountData;
};

export default Paypal;
