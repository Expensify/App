/** Model of security group */
type SecurityGroup = {
    /** Whether the security group restricts primary login switching */
    enableRestrictedPrimaryLogin: boolean;

    /** Whether the security group restricts policy creation for group members */
    enableRestrictedPolicyCreation: boolean;

    /** The default unapproved expense limit for cards in the security group */
    defaultCardUnapprovedExpenseLimit?: number;

    /** Whether we should prevent user on this security group from selecting an other primary email address */
    enableRestrictedPrimaryPolicy?: boolean;

    /** Whether the card transactions should submit to the card preferred policy instead of the group preferred policy? */
    overridePreferredPolicyWithCardPolicy?: boolean;

    /** ID of the restricted primary policy for this domain security group */
    restrictedPrimaryPolicyID?: string;

    /** Whether we should prevent a user from submitting a report with policy violations? */
    enableStrictPolicyRules?: boolean;

    /** Name of the security group */
    name?: string;
};

/**
 * Per-domain entry stored in the MY_DOMAIN_SECURITY_GROUPS map, used to locate the user's security group.
 * During the backend rollout this may still be the legacy `string` (the securityGroupID only) instead of the object form.
 */
type DomainSecurityGroupMembership =
    | string
    | {
          /** ID of the user's security group within the domain */
          securityGroupID: string;

          /** Account ID of the domain that owns the security group shared NVP */
          ownerAccountID: number;
      };

export default SecurityGroup;
export type {DomainSecurityGroupMembership};
