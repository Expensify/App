type UpdateOfficeLocationParams = {
    policyID: string;
    officeID: string;

    /** New nickname of the office */
    officeName?: string;

    /** JSON-encoded address with addressStreet, city, state, zipCode and country, the same shape as the workspace address */
    address?: string;

    /** Makes the office the workspace default */
    isDefault?: boolean;
};

export default UpdateOfficeLocationParams;
