/** Applied Expensify promo discount data from private NVP */
type PrivatePromoDiscount =
    | number
    | {
          /** Discount percentage for monthly subscriptions */
          monthlySubscriptionDiscount: number;

          /** Discount percentage for yearly subscriptions */
          yearlySubscriptionDiscount: number;

          /** Whether the promo code is secret and should be hidden from account settings */
          isSecretPromoCode: boolean;
      };

export default PrivatePromoDiscount;
