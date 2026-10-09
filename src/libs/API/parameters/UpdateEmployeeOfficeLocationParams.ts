type UpdateEmployeeOfficeLocationParams = {
    policyID: string;

    /**
     * Comma-separated logins of the employees to update. Supports individual and bulk updates. Logins stay the same when
     * an offline invite replaces a member's temporary accountID before the request runs.
     */
    employeeLoginList: string;

    /** Office to assign, keyed in the workspace's officeLocations, or CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID for the company address */
    officeID: string;
};

export default UpdateEmployeeOfficeLocationParams;
