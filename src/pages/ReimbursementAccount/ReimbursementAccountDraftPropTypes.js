import PropTypes from 'prop-types';

export default PropTypes.shape({
    bankAccountID: PropTypes.number,

    /** Props needed for BankAccountStep */
    accountNumber: PropTypes.string,
    routingNumber: PropTypes.string,
    acceptTerms: PropTypes.bool,
    plaidAccountID: PropTypes.string,
    plaidMask: PropTypes.string,

    /** Props needed for CompanyStep */
    companyName: PropTypes.string,
    addressStreet: PropTypes.string,
    addressCity: PropTypes.string,
    addressState: PropTypes.string,
    addressZipCode: PropTypes.string,
    companyPhone: PropTypes.string,
    website: PropTypes.string,
    companyTaxID: PropTypes.string,
    incorporationType: PropTypes.string,
    incorporationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    incorporationState: PropTypes.string,
    hasNoConnectionToCannabis: PropTypes.bool,

    /** Props needed for RequestorStep */
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    requestorAddressStreet: PropTypes.string,
    requestorAddressCity: PropTypes.string,
    requestorAddressState: PropTypes.string,
    requestorAddressZipCode: PropTypes.string,
    dob: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    ssnLast4: PropTypes.string,
    isControllingOfficer: PropTypes.bool,
    isOnfidoSetupComplete: PropTypes.bool,

    /** Props needed for ACHContractStep */
    ownsMoreThan25Percent: PropTypes.bool,
    hasOtherBeneficialOwners: PropTypes.bool,
    acceptTermsAndConditions: PropTypes.bool,
    certifyTrueInformation: PropTypes.bool,
    beneficialOwners: PropTypes.arrayOf(PropTypes.string),
});
