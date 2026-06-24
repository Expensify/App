type PrivatePersonalDetailsType = {
    legalFirstName: string;
    legalLastName: string;
    dob: string;

    /** User's home address */
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
};

export default PrivatePersonalDetailsType;
