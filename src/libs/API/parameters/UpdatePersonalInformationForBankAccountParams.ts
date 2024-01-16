type UpdatePersonalInformationForBankAccountParams = {
    firstName?: string;
    lastName?: string;
    requestorAddressStreet?: string;
    requestorAddressCity?: string;
    requestorAddressState?: string;
    requestorAddressZipCode?: string;
    dob?: string | Date;
    ssnLast4?: string;
    isControllingOfficer?: boolean;
    isOnfidoSetupComplete?: boolean;
    onfidoData?: OnfidoData;
};

export default UpdatePersonalInformationForBankAccountParams;
