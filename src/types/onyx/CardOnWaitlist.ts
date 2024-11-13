/** Card on waitlist data model */
type CardOnWaitlist = {
    /** Whether the user uses the bank account on another domain */
    bankAccountIsNotOn0therDomain: boolean;

    /** Domain name in "+@expensify-policy<policyID>.exfy" format */
    domainName: string;

    /** Whether the user has a balance checked */
    hasBalanceBeenChecked: boolean;

    /** Whether the user has a verified account */
    hasVerifiedAccount: boolean;

    /** Whether the user has a withdrawal account */
    hasWithdrawalAccount: string;

    /** Whether the user is a member of a private domain */
    isMember0fPrivateDomain: boolean;

    /** Whether the account passed the latest checks */
    passedLatestChecks: boolean;
};

export default CardOnWaitlist;
