type AddOfficeLocationParams = {
    policyID: string;

    /** Client-generated ID of the new office */
    officeID: string;

    /** JSON-encoded address with addressStreet, city, state, zipCode and country, the same shape as the workspace address */
    address: string;

    /** Nickname of the office. Offices added without one are named "Office location N" */
    name?: string;

    /** Whether the office becomes the workspace default */
    isDefault?: boolean;
};

export default AddOfficeLocationParams;
