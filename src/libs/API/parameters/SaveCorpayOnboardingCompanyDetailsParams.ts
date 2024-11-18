type SaveCorpayOnboardingCompanyDetailsParams = {
    companyName: string;
    companyStreetAddress: string;
    companyCity: string;
    companyState?: string;
    companyPostalCode: string;
    companyCountryCode: string;
    businessContactNumber: string;
    businessConfirmationEmail: string;
    formationIncorporationCountryCode: string;
    formationIncorporationState?: string;
    businessRegistrationIncorporationNumber: string;
    applicantTypeID: string;
    purposeOfTransactionId: string;
    currencyNeeded: string;
    tradeVolume: string;
    annualVolume: string;
    fundDestinationCountries: string;
    fundSourceCountries: string;
    bankAccountID: string;
};

export default SaveCorpayOnboardingCompanyDetailsParams;
