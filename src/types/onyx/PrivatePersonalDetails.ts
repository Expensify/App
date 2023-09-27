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
};

export default PrivatePersonalDetails;
