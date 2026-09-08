type MergeIntoAccountAndLogInParams = {
    workEmail: string | undefined;
    validateCode: string;
    accountID: number | undefined;
    completedTaskReportActionID?: string;
};

export default MergeIntoAccountAndLogInParams;
