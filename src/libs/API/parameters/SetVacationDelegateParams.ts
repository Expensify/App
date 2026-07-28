type SetVacationDelegateParams = {
    creator: string;
    vacationerEmail?: string;
    vacationDelegateEmail: string;
    overridePolicyDiffWarning: boolean;
    domainAccountID?: number;
};

export default SetVacationDelegateParams;
