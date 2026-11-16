import type CONST from '@src/CONST';

type SaveCorpayOnboardingCompanyDetails = {
    annualVolume: string;
    applicantTypeId: string;
    companyName: string;
    dbaOrRegisteredTradeName?: string;
    dateOfIncorporation?: string;
    otherBusinessLegalStructure?: string;
    sourceOfFunds?: string;
    otherSourceOfFunds?: string;
    numberOfMonthlyTransaction?: number;
    expectedFrequencyOfTransactions?: string;
    clientIntendsToUseCorpayAccountTo?: string;
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
    natureOfBusiness: string;
    purposeOfTransactionId: typeof CONST.NON_USD_BANK_ACCOUNT.PURPOSE_OF_TRANSACTION_ID;
    tradeVolume: string;
    taxIDEINNumber: string;
    businessTypeId?: string;
    isClientCharitableOrganization?: boolean;
    isClientDealerInStonesPreciousMetals?: boolean;
    isClientHighValueDealer?: boolean;
    isClientNetworkMarketingCompany?: boolean;
    isClientRealEstateCompany?: boolean;
    isClientTravelOrTourCompany?: boolean;
    isClientCannabisRelatedCompany?: boolean;
    isClientCryptoCompany?: boolean;
    isClientMSBFI?: boolean;
};

type SaveCorpayOnboardingCompanyDetailsParams = {
    inputs: string;
    bankAccountID: number;
};

export type {SaveCorpayOnboardingCompanyDetails, SaveCorpayOnboardingCompanyDetailsParams};
