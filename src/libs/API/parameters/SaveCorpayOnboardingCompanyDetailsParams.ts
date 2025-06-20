import type CONST from '@src/CONST';

type SaveCorpayOnboardingCompanyDetails = {
    annualVolume: string;
    applicantTypeId: string;
    companyName: string;
    companyStreetAddress: string;
    companyCity: string;
    companyState?: string;
    companyPostalCode: string;
    companyCountryCode: string;
    currencyNeeded: string;
    businessContactNumber: string;
    businessConfirmationEmail: string;
    businessRegistrationIncorporationNumber: string;
    formationIncorporationCountryCode: string;
    formationIncorporationState?: string;
    fundDestinationCountries: string;
    fundSourceCountries: string;
    natureOfBusiness: string;
    purposeOfTransactionId: typeof CONST.NON_USD_BANK_ACCOUNT.PURPOSE_OF_TRANSACTION_ID;
    tradeVolume: string;
    taxIDEINNumber: string;
};

type SaveCorpayOnboardingCompanyDetailsParams = {
    inputs: string;
    bankAccountID: number;
};

export type {SaveCorpayOnboardingCompanyDetails, SaveCorpayOnboardingCompanyDetailsParams};
