/** Model of Stripe customer */
type StripeCustomerID = {
    /** Payment method's ID */
    paymentMethodID: string;

    /** Intent's ID */
    intentsID: string;

    /** Payment currency */
    currency: string;

    /** Payment status */
    status: 'authentication_required' | 'intent_required' | 'succeeded';
};

export default StripeCustomerID;
