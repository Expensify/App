import type * as OnyxCommon from './OnyxCommon';

/** Applied Expensify promo discount data */
type PrivatePromoDiscount = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Applied promo code */
    promoCode?: string;

    /** Whether the promo code is secret and should be hidden from account settings */
    isSecretPromoCode?: boolean;

    /** Discount percentage */
    promoDiscount?: string;

    /** Number of valid billing cycles */
    validBillingCycles?: string;
}>;

export default PrivatePromoDiscount;
