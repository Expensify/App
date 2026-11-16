type SetVacationDelegateParams = {
    creator: string;
    vacationerEmail?: string;
    vacationDelegateEmail: string;

    /** UTC datetime (yyyy-MM-dd HH:mm:ss) when the backend should clear the vacation delegate */
    clearAfter?: string;
    overridePolicyDiffWarning: boolean;
    domainAccountID?: number;
};

export default SetVacationDelegateParams;
