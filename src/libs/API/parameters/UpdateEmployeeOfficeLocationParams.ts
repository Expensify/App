type UpdateEmployeeOfficeLocationParams = {
    policyID: string;

    /** Comma-separated accountIDs of the employees to update. Supports individual and bulk updates. */
    employeeAccountIDList: string;

    /** Comma-separated logins of the same employees, which still match them once an offline invite replaces their accountIDs */
    employeeLoginList: string;

    /** Office to assign, keyed in the workspace's officeLocations, or CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID for the company address */
    officeID: string;
};

export default UpdateEmployeeOfficeLocationParams;
