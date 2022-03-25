import Onyx from 'react-native-onyx';
import * as BankAccounts from '../../src/libs/actions/BankAccounts';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';
import HttpUtils from '../../src/libs/HttpUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';
import BankAccount from '../../src/libs/models/BankAccount';
import * as NetworkStore from '../../src/libs/Network/NetworkStore';

const TEST_BANK_ACCOUNT_ID = 1;
const TEST_BANK_ACCOUNT_CITY = 'Opa-locka';
const TEST_BANK_ACCOUNT_STATE = 'FL';
const TEST_BANK_ACCOUNT_STREET = '1234 Sesame Street';
const TEST_BANK_ACCOUNT_ZIP = '33054';
const TEST_BANK_ACCOUNT_NUMBER = '1111222233331111';
const TEST_BANK_ACCOUNT_NUMBER_MASKED = '111122XXXXXX1111';
const TEST_BANK_ACCOUNT_ROUTING_NUMBER = '011401533';
const TEST_BANK_ACCOUNT_WEBSITE = 'https://www.test.com';

const FREE_PLAN_NVP_RESPONSE = {
    jsonCode: 200,
    nameValuePairs: {
        expensify_freePlanBankAccountID: TEST_BANK_ACCOUNT_ID,
    },
};

HttpUtils.xhr = jest.fn();

let reimbursementAccount;
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: val => reimbursementAccount = val,
});

beforeEach(() => Onyx.clear()
    .then(() => {
        NetworkStore.setHasReadRequiredDataFromStorage(true);
        TestHelper.signInWithTestUser();
        return waitForPromisesToResolve();
    }));

describe('actions/BankAccounts', () => {
    // eslint-disable-next-line arrow-body-style
    it('should fetch the correct initial state for a user with no account in setup. And direct them to the correct steps after calling SetupWithdrawalAccount', () => {
        // GIVEN a mock response for a call to Get&returnValueList=nameValuePairs&name=expensify_freePlanBankAccountID that should return nothing
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
            jsonCode: 200,
            nameValuePairs: [],
        }));

        // and a mock response for a call to Get&returnValueList=nameValuePairs,bankAccountList&nvpNames that should return no account
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
            jsonCode: 200,
            nameValuePairs: [],
            bankAccountList: [],
        }));

        // WHEN we fetch the bank account
        BankAccounts.fetchFreePlanVerifiedBankAccount();
        return waitForPromisesToResolve()
            .then(() => {
                // THEN we should expect it to stop loading and bring us to the BankAccountStep
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
                expect(reimbursementAccount.achData.isInSetup).toBe(true);

                // WHEN we mock a successful call to SetupWithdrawalAccount with a manual account
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                }));
                BankAccounts.setupWithdrawalAccount({
                    acceptTerms: true,
                    country: 'US',
                    currency: 'USD',
                    accountNumber: TEST_BANK_ACCOUNT_NUMBER,
                    fieldsType: 'local',
                    routingNumber: TEST_BANK_ACCOUNT_ROUTING_NUMBER,
                    setupType: CONST.BANK_ACCOUNT.SUBSTEP.MANUAL,
                });
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN we should advance to the CompanyStep and the enableCardAfterVerified param should be added
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.COMPANY);
                expect(reimbursementAccount.achData.enableCardAfterVerified).toBe(true);
                expect(reimbursementAccount.achData.setupType).toBe(CONST.BANK_ACCOUNT.SUBSTEP.MANUAL);

                // GIVEN another mock response to simulate the user completing the CompanyStep
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    achData: {
                        bankAccountID: TEST_BANK_ACCOUNT_ID,
                    },
                }));

                // and a mock to SetNameValuePair call that updates the "free plan" bankAccountID
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                }));

                // WHEN we call setupWithdrawalAccount again with CompanyStep data
                BankAccounts.setupWithdrawalAccount({
                    companyName: 'Alberta Bobbeth Charleson',
                    companyPhone: '5165671515',
                    companyTaxID: '123456789',
                    incorporationDate: '2021-01-01',
                    incorporationState: TEST_BANK_ACCOUNT_STATE,
                    incorporationType: 'LLC',
                    addressCity: TEST_BANK_ACCOUNT_CITY,
                    addressState: TEST_BANK_ACCOUNT_STATE,
                    addressStreet: TEST_BANK_ACCOUNT_STREET,
                    addressZipCode: TEST_BANK_ACCOUNT_ZIP,
                    hasNoConnectionToCannabis: true,
                    website: TEST_BANK_ACCOUNT_WEBSITE,
                });
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN we should advance to the RequestorStep
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
            });
    });

    it('fetch the correct step for account in setup that has completed the CompanyStep. Redirect to the ACHContract step after calling SetupWithdrawalAccount via RequestorStep', () => {
        // GIVEN a mock response for a call to Get&returnValueList=nameValuePairs&name=expensify_freePlanBankAccountID that returns a bankAccountID
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve(FREE_PLAN_NVP_RESPONSE));

        // and a mock response for a call to Get&returnValueList=nameValuePairs,bankAccountList&nvpNames that should return a bank account in the list
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
            jsonCode: 200,
            nameValuePairs: [],
            bankAccountList: [{
                accountNumber: TEST_BANK_ACCOUNT_NUMBER_MASKED,
                additionalData: {
                    currentStep: CONST.BANK_ACCOUNT.STEP.COMPANY,
                },
                bankAccountID: TEST_BANK_ACCOUNT_ID,
                state: BankAccount.STATE.SETUP,
                routingNumber: TEST_BANK_ACCOUNT_ROUTING_NUMBER,
            }],
        }));

        // WHEN we fetch the bank account
        BankAccounts.fetchFreePlanVerifiedBankAccount();
        return waitForPromisesToResolve()
            .then(() => {
                // THEN we should to navigate to the RequestorStep
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
                expect(reimbursementAccount.achData.bankAccountID).toBe(TEST_BANK_ACCOUNT_ID);
                expect(reimbursementAccount.achData.isInSetup).toBe(true);
                expect(reimbursementAccount.achData.accountNumber).toBe(TEST_BANK_ACCOUNT_NUMBER_MASKED);
                expect(reimbursementAccount.achData.routingNumber).toBe(TEST_BANK_ACCOUNT_ROUTING_NUMBER);
                expect(reimbursementAccount.achData.state).toBe(BankAccount.STATE.SETUP);

                // GIVEN a mocked response for SetupWithdrawalAccount
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    achData: {
                        bankAccountID: TEST_BANK_ACCOUNT_ID,
                        isOnfidoSetupComplete: true,
                    },
                }));

                // And mock resonse to SetNameValuePair
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({jsonCode: 200}));

                // WHEN we call setupWithdrawalAccount on the RequestorStep
                BankAccounts.setupWithdrawalAccount({
                    dob: '1980-01-01',
                    firstName: 'Alberta',
                    isControllingOfficer: true,
                    lastName: 'Charleson',
                    onfidoData: '',
                    ssnLast4: '1234',
                    requestorAddressCity: TEST_BANK_ACCOUNT_CITY,
                    requestorAddressState: TEST_BANK_ACCOUNT_STATE,
                    requestorAddressStreet: TEST_BANK_ACCOUNT_STREET,
                    requestorAddressZipCode: TEST_BANK_ACCOUNT_ZIP,
                    isOnfidoSetupComplete: false,
                });
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN we should move to the ACHContract step and Onfido should be marked as complete
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT);
                expect(reimbursementAccount.achData.isOnfidoSetupComplete).toBe(true);
            });
    });

    it('should fetch the correct initial state for a user with an account in setup (bailed after RequestorStep and did NOT complete Onfido)', () => {
        // GIVEN a mock response for a call to Get&returnValueList=nameValuePairs&name=expensify_freePlanBankAccountID that returns a bankAccountID
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve(FREE_PLAN_NVP_RESPONSE));

        // and a mock response for a call to Get&returnValueList=nameValuePairs,bankAccountList&nvpNames that should return a bank account that has completed both
        // the RequestorStep and CompanyStep, but not completed Onfido
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
            jsonCode: 200,
            nameValuePairs: [],
            bankAccountList: [{
                accountNumber: TEST_BANK_ACCOUNT_NUMBER_MASKED,
                additionalData: {
                    currentStep: CONST.BANK_ACCOUNT.STEP.REQUESTOR,
                    isOnfidoSetupComplete: false,
                },
                bankAccountID: TEST_BANK_ACCOUNT_ID,
                state: BankAccount.STATE.SETUP,
                routingNumber: TEST_BANK_ACCOUNT_ROUTING_NUMBER,
            }],
        }));

        // WHEN we fetch the bank account
        BankAccounts.fetchFreePlanVerifiedBankAccount();
        return waitForPromisesToResolve()
            .then(() => {
                // THEN we should expect it redirect the user back to the RequestorStep because they still need to do Onfido
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
            });
    });

    it('should fetch the correct initial state for a user with an account in setup (bailed after RequestorStep - but completed Onfido)', () => {
        // GIVEN a mock response for a call to Get&returnValueList=nameValuePairs&name=expensify_freePlanBankAccountID that returns a bankAccountID
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve(FREE_PLAN_NVP_RESPONSE));

        // and a mock response for a call to Get&returnValueList=nameValuePairs,bankAccountList&nvpNames that should return a bank account
        // that has completed both the RequestorStep and CompanyStep and has completed Onfido
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
            jsonCode: 200,
            nameValuePairs: [],
            bankAccountList: [{
                accountNumber: TEST_BANK_ACCOUNT_NUMBER_MASKED,
                additionalData: {
                    currentStep: CONST.BANK_ACCOUNT.STEP.REQUESTOR,
                    isOnfidoSetupComplete: true,
                },
                bankAccountID: TEST_BANK_ACCOUNT_ID,
                state: BankAccount.STATE.SETUP,
                routingNumber: TEST_BANK_ACCOUNT_ROUTING_NUMBER,
            }],
        }));

        // WHEN we fetch the bank account
        BankAccounts.fetchFreePlanVerifiedBankAccount();
        return waitForPromisesToResolve()
            .then(() => {
                // THEN we should expect to be navigated to the ACHContractStep step
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT);

                // WHEN we mock a sucessful call to SetupWithdrawalAccount while on the ACHContractStep
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    achData: {
                        bankAccountID: TEST_BANK_ACCOUNT_ID,
                    },
                }));

                // And mock SetNameValuePair response
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({jsonCode: 200}));

                // And mock the response of Get&returnValueList=bankAccountList
                HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
                    jsonCode: 200,
                    bankAccountList: [{
                        bankAccountID: TEST_BANK_ACCOUNT_ID,
                        state: BankAccount.STATE.PENDING,
                    }],
                }));

                // WHEN we call setupWithdrawalAccount via the ACHContractStep
                BankAccounts.setupWithdrawalAccount({
                    acceptTermsAndConditions: true,
                    beneficialOwners: [],
                    certifyTrueInformation: true,
                    hasOtherBeneficialOwners: false,
                    ownsMoreThan25Percent: true,
                });
                return waitForPromisesToResolve();
            })
            .then(() => {
                // THEN we should expect to have an account in the PENDING state and be brought to the ValidationStep
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.VALIDATION);
                expect(reimbursementAccount.achData.state).toBe(BankAccount.STATE.PENDING);
            });
    });

    it('should fetch the correct initial state for a user on the ACHContractStep in PENDING state', () => {
        // GIVEN a mock response for a call to Get&returnValueList=nameValuePairs&name=expensify_freePlanBankAccountID that returns a bankAccountID
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve(FREE_PLAN_NVP_RESPONSE));

        // and a mock response for a call to Get&returnValueList=nameValuePairs,bankAccountList&nvpNames that should return a bank account that has completed both
        // the RequestorStep, CompanyStep, and ACHContractStep and is now PENDING
        HttpUtils.xhr
            .mockImplementationOnce(() => Promise.resolve({
                jsonCode: 200,
                nameValuePairs: [],
                bankAccountList: [{
                    accountNumber: TEST_BANK_ACCOUNT_NUMBER_MASKED,
                    additionalData: {
                        currentStep: CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
                        isOnfidoSetupComplete: true,
                    },
                    bankAccountID: TEST_BANK_ACCOUNT_ID,
                    state: BankAccount.STATE.PENDING,
                    routingNumber: TEST_BANK_ACCOUNT_ROUTING_NUMBER,
                }],
            }));

        // WHEN we fetch the account
        BankAccounts.fetchFreePlanVerifiedBankAccount();
        return waitForPromisesToResolve()
            .then(() => {
                // THEN we should see that we are directed to the ValidationStep
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.achData.currentStep).toBe(CONST.BANK_ACCOUNT.STEP.VALIDATION);
                expect(reimbursementAccount.achData.state).toBe(BankAccount.STATE.PENDING);
            });
    });

    it('should return the correct state when a user has reached the max validation attempts', () => {
        // GIVEN a mock response for a call to Get&returnValueList=nameValuePairs&name=expensify_freePlanBankAccountID that returns a bankAccountID
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve(FREE_PLAN_NVP_RESPONSE));

        // and a mock response for a call to Get&returnValueList=nameValuePairs,bankAccountList&nvpNames that
        // should return a bank account that has completed both the RequestorStep, CompanyStep, and ACHContractStep
        // and is now PENDING - but has attempted to validate too many times.
        HttpUtils.xhr.mockImplementationOnce(() => Promise.resolve({
            jsonCode: 200,
            nameValuePairs: {
                [`private_failedBankValidations_${TEST_BANK_ACCOUNT_ID}`]: 8,
            },
            bankAccountList: [{
                accountNumber: TEST_BANK_ACCOUNT_NUMBER_MASKED,
                additionalData: {
                    currentStep: CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
                    isOnfidoSetupComplete: true,
                },
                bankAccountID: TEST_BANK_ACCOUNT_ID,
                state: BankAccount.STATE.PENDING,
                routingNumber: TEST_BANK_ACCOUNT_ROUTING_NUMBER,
            }],
        }));

        // WHEN we fetch the account
        BankAccounts.fetchFreePlanVerifiedBankAccount();
        return waitForPromisesToResolve()
            .then(() => {
                // THEN it should have maxAttemptsReached set to true and show the correct data set in Onyx
                expect(reimbursementAccount.loading).toBe(false);
                expect(reimbursementAccount.error).toBe('');
                expect(reimbursementAccount.maxAttemptsReached).toBe(true);
            });
    });
});
