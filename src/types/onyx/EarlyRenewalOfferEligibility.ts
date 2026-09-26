/** The current user's available Early Renewal 2027 action */
type EarlyRenewalOfferEligibility =
    | {
          /** Whether the current user can accept the offer as the billing owner */
          canClaim: true;
          nudgePolicyID?: never;
      }
    | {
          /** Whether the current user can accept the offer as the billing owner */
          canClaim: false;

          /** The policy whose billing owner the current user can nudge */
          nudgePolicyID: string;
      };

export default EarlyRenewalOfferEligibility;
