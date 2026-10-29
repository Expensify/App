type PayPalMeDataType = {
    /** This is always 'PayPal.me' */
    title: 'PayPal.me';

    /** The paypalMe address */
    description: string;

    /** This is always 'payPalMe' */
    methodID: 'payPalMe';

    /** This is always 'payPalMe' */
    accountType: 'payPalMe';
};

export default PayPalMeDataType;
