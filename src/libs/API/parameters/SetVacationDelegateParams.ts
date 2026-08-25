type SetVacationDelegateParams = {
    creator: string;
    vacationerEmail?: string;
    vacationDelegateEmail: string;
    overridePolicyDiffWarning: boolean;
    domainAccountID?: number;
    skipPolicyInviteEmails?: boolean;
};

export default SetVacationDelegateParams;
