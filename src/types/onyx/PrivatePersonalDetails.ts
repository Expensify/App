type Address = {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
};

type PrivatePersonalDetails = {
    legalFirstName?: string;
    legalLastName?: string;
    dob?: string;

    /** User's home address */
    address?: Address;

    /** Whether we are loading the data via the API */
    isLoading?: boolean;
};

export default PrivatePersonalDetails;
