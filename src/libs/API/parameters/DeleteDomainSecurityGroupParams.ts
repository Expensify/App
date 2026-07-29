type DeleteDomainSecurityGroupParams = {
    /** The account ID of the domain */
    domainAccountID: number;

    /** The key of the security group (e.g domain_securityGroup_12345) */
    name: string;
};

export default DeleteDomainSecurityGroupParams;
