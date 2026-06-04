type DeleteDomainMemberParams = {
    targetEmail: string;
    domain: string;
    domainAccountID: number;
    overrideProcessingReports: boolean;
};

export default DeleteDomainMemberParams;
