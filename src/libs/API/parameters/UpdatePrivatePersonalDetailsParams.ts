type UpdatePrivatePersonalDetailsParams = {
    legalFirstName: string;
    legalLastName: string;
    phoneNumber: string;
    addressCity: string;
    addressStreet: string;
    addressStreet2: string;
    addressZip: string;
    addressCountry: string;
    dob: string;
    validateCode: string;
    addressState: string;
    addressProvince: string;
    addressLat?: string;
    addressLng?: string;
};

export default UpdatePrivatePersonalDetailsParams;
