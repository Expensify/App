/** Model of private stripe customer ID */
type PrivateStripeCustomer = {
    /** Currency of the stripe payment */
    [currency: string]: string;
    /** paymentMethodID of the stripe payment */
    paymentMethodID: string;
    /** Status of the stripe payment */
    status: string;
};

export default PrivateStripeCustomer;
