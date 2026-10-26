type SetEmployeeWorkArrangementParams = {
    policyID: string;

    /** Comma-separated accountIDs of the employees to update. Supports individual and bulk updates. */
    employeeAccountIDList: string;

    /** Comma-separated member logins, used to match updates queued before an offline invite receives its real accountID. */
    employeeLoginList: string;

    /** True for office-based, false for no regular workspace. */
    isOffice: boolean;
};

export default SetEmployeeWorkArrangementParams;
