type SetPersonalDetailsAndRevealExpensifyCardParams = {
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
    cardID: number;
} & ({addressState: string} | {addressProvince: string});

export default SetPersonalDetailsAndRevealExpensifyCardParams;
