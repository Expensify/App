type SetEmployeeWorkArrangementParams = {
    policyID: string;

    /** Comma-separated accountIDs of the employees to update. Supports individual and bulk updates. */
    employeeAccountIDList: string;

    /** True for office-based, false for no regular workspace. */
    isOffice: boolean;
};

export default SetEmployeeWorkArrangementParams;
