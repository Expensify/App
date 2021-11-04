import CONST from '../../src/CONST';
import {getCurrentStep} from '../../src/libs/actions/ReimbursementAccount/fetchFreePlanVerifiedBankAccount';
import BankAccount from '../../src/libs/models/BankAccount';

describe('fetchFreePlanVerifiedBankAccount', () => {
    it('Returns BankAccountStep when there is no step in storage, achData, bankAccount, etc', () => {
        // GIVEN a bank account that doesn't yet exist and no stepToOpen
        const nullBankAccount = null;
        const achData = {};

        // WHEN we get the current step
        const currentStep = getCurrentStep('', '', achData, nullBankAccount, false);

        // THEN it will be the BankAccountStep
        expect(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT).toBe(currentStep);
    });

    it('Returns whatever step we give for stepToOpen', () => {
        // GIVEN a bank account that doesn't yet exist and has a stepToOpen
        const nullBankAccount = null;
        const achData = {};
        const stepToOpen = CONST.BANK_ACCOUNT.STEP.COMPANY;

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, nullBankAccount, false);

        // THEN it will be whatever we set the stepToOpen to be
        expect(CONST.BANK_ACCOUNT.STEP.COMPANY).toBe(currentStep);
    });

    it('Returns the logical next step if we have a currentStep in achData', () => {
        // GIVEN a bank account that does exist and has no stepToOpen and "isInSetup"
        const bankAccount = new BankAccount({});
        const achData = {currentStep: CONST.BANK_ACCOUNT.STEP.COMPANY, isInSetup: true};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, false);

        // THEN it will be the logical next step
        expect(CONST.BANK_ACCOUNT.STEP.REQUESTOR).toBe(currentStep);
    });

    it('Returns the requestor step if we have to do onfido', () => {
        // GIVEN a bank account that does exist and has no stepToOpen and "isInSetup" and must do Onfido
        const bankAccount = new BankAccount({});
        const achData = {
            currentStep: CONST.BANK_ACCOUNT.STEP.REQUESTOR,
            isInSetup: true,
            isOnfidoSetupComplete: false,
        };
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, false);

        // THEN we will stay on the requestor step
        expect(CONST.BANK_ACCOUNT.STEP.REQUESTOR).toBe(currentStep);
    });

    it('Returns steps based on pending BankAccount if there is no current step in achData or device storage', () => {
        // GIVEN a pending bank account, but no currentStep in achData or device storage
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.PENDING,
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, false);

        // THEN it will be the validation step
        expect(CONST.BANK_ACCOUNT.STEP.VALIDATION).toBe(currentStep);
    });

    it('Returns steps based on verifying BankAccount if there is no current step in achData or device storage', () => {
        // GIVEN a pending bank account, but no currentStep in achData or device storage
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.VERIFYING,
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, false);

        // THEN it will be the validation step
        expect(CONST.BANK_ACCOUNT.STEP.VALIDATION).toBe(currentStep);
    });

    it('Returns step based on open BankAccount that needs to pass checks and has not yet attempted upgrade', () => {
        // GIVEN an open bank account that needs to pass checks and has not yet tried to upgrade
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.OPEN,
            additionalData: {
                hasFullSSN: false,
            },
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, false);

        // THEN it will be the company step
        expect(CONST.BANK_ACCOUNT.STEP.COMPANY).toBe(currentStep);
    });

    it('Returns step based on open BankAccount that needs to pass checks and has attempted upgrade', () => {
        // GIVEN an open bank account that needs to pass checks and has tried to upgrade
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.OPEN,
            additionalData: {
                hasFullSSN: false,
            },
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, true);

        // THEN it will be the validation step
        expect(CONST.BANK_ACCOUNT.STEP.VALIDATION).toBe(currentStep);
    });

    it('Returns step based on open BankAccount that does not need to pass checks', () => {
        // GIVEN an open bank account that does not need to pass checks
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.OPEN,
            additionalData: {
                hasFullSSN: true,
                beneficialOwners: [{
                    hasFullSSN: true,
                    isRequestor: true,
                    expectIDPA: {
                        status: 'pass',
                    },
                }],
                requestorAddressCity: 'Portland',
                verifications: {
                    externalApiResponses: {
                        realSearchResult: {
                            status: 'pass',
                        },
                        lexisNexisInstantIDResult: {
                            status: 'pass',
                        },
                        requestorIdentityID: {
                            status: 'pass',
                        },
                    },
                },
            },
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, true);

        // THEN it will be the enable step
        expect(CONST.BANK_ACCOUNT.STEP.ENABLE).toBe(currentStep);
    });

    it('Returns step based on deleted BankAccount and no currentStep', () => {
        // GIVEN a deleted bank account
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.DELETED,
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = getCurrentStep(stepToOpen, '', achData, bankAccount, true);

        // THEN it will be the bank account step
        expect(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT).toBe(currentStep);
    });
});
