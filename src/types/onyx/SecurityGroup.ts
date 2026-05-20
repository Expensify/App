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

export default SecurityGroup;
