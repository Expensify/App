/** Card on waitlist data model */
type CardOnWaitlist = {
    bankAccountIsNotOnOtherDomain: boolean;

    /** Domain name in "+@expensify-policy<policyID>.exfy" format */
    domainName: string;

    hasBalanceBeenChecked: boolean;
    hasVerifiedAccount: boolean;
    hasWithdrawalAccount: string;
    isMember0fPrivateDomain: boolean;

    /** Whether the account passed the latest checks */
    passedLatestChecks: boolean;
};

export default CardOnWaitlist;
