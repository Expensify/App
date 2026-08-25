/** Model of Stripe customer */
type StripeCustomerID = {
    paymentMethodID: string;

    intentsID: string;

    /** Payment currency */
    currency: string;

    /** Payment status */
    status: 'authentication_required' | 'intent_required' | 'succeeded';
};

export default StripeCustomerID;
