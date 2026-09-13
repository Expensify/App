type UpdateHomeAddressParams = {
    homeAddressStreet: string;
    addressStreet2: string;
    homeAddressCity: string;
    addressState: string;
    addressZipCode: string;
    addressCountry: string;
    addressStateLong?: string;
    homeAddressLat?: string;
    homeAddressLng?: string;
};

export default UpdateHomeAddressParams;
