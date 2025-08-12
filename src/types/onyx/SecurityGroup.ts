/** Model of security group */
type SecurityGroup = {
    /** Whether the security group restricts primary login switching */
    hasRestrictedPrimaryLogin: boolean;

    /** Whether the security group restricts workspace creation for non-admin users */
    enableRestrictedPolicyCreation?: boolean;
};

export default SecurityGroup;
