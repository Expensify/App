import CONST from '../../src/CONST';
import * as fetchFreePlanVerifiedBankAccount from '../../src/libs/actions/ReimbursementAccount/fetchFreePlanVerifiedBankAccount';
import BankAccount from '../../src/libs/models/BankAccount';

describe('getCurrentStep', () => {
    it('Returns BankAccountStep when there is no step in storage, achData, bankAccount, etc', () => {
        // GIVEN a bank account that doesn't yet exist and no stepToOpen
        const nullBankAccount = null;
        const achData = {};

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep('', achData, nullBankAccount, false);

        // THEN it will be the BankAccountStep
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
    });

    it('Returns BankAccountStep when there is no step in storage or bankAccount but is achData', () => {
        // GIVEN a bank account that doesn't yet exist and no stepToOpen
        const nullBankAccount = null;
        const achData = {
            bankAccountInReview: false,
            domainLimit: 0,
            isInSetup: true,
            policyID: '',
            subStep: '',
            useOnfido: true,
        };

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep('', achData, nullBankAccount, false);

        // THEN it will be the BankAccountStep
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
    });

    it('Returns whatever step we give for stepToOpen', () => {
        // GIVEN a bank account that doesn't yet exist and has a stepToOpen
        const nullBankAccount = null;
        const achData = {};
        const stepToOpen = CONST.BANK_ACCOUNT.STEP.COMPANY;

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep(stepToOpen, achData, nullBankAccount, false);

        // THEN it will be whatever we set the stepToOpen to be
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.COMPANY);
    });

    it('Returns the logical next step if we have a currentStep in achData', () => {
        // GIVEN a bank account that does exist and has no stepToOpen and "isInSetup"
        const bankAccount = new BankAccount({});
        const achData = {currentStep: CONST.BANK_ACCOUNT.STEP.COMPANY, isInSetup: true};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep(stepToOpen, achData, bankAccount, false);

        // THEN it will be the logical next step
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
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
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep(stepToOpen, achData, bankAccount, false);

        // THEN we will stay on the requestor step
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
    });

    it('Returns steps based on pending BankAccount if there is no current step in achData or device storage', () => {
        // GIVEN a pending bank account, but no currentStep in achData or device storage
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.PENDING,
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep(stepToOpen, achData, bankAccount, false);

        // THEN it will be the validation step
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.VALIDATION);
    });

    it('Returns steps based on verifying BankAccount if there is no current step in achData or device storage', () => {
        // GIVEN a pending bank account, but no currentStep in achData or device storage
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.VERIFYING,
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep(stepToOpen, achData, bankAccount, false);

        // THEN it will be the validation step
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.VALIDATION);
    });

    it('Returns step based on open BankAccount', () => {
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
            },
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep(stepToOpen, achData, bankAccount, true);

        // THEN it will be the enable step
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.ENABLE);
    });

    it('Returns step based on deleted BankAccount and no currentStep', () => {
        // GIVEN a deleted bank account
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.DELETED,
        });
        const achData = {};
        const stepToOpen = '';

        // WHEN we get the current step
        const currentStep = fetchFreePlanVerifiedBankAccount.getCurrentStep(stepToOpen, achData, bankAccount, true);

        // THEN it will be the bank account step
        expect(currentStep).toBe(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
    });
});

describe('buildACHData()', () => {
    it('Returns the correct shape for a bank account in setup', () => {
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.SETUP,
        });
        const achData = fetchFreePlanVerifiedBankAccount.buildACHData(bankAccount);
        expect(achData).toEqual({
            useOnfido: true,
            policyID: '',
            isInSetup: true,
            bankAccountInReview: false,
            domainLimit: 0,
            needsToUpgrade: false,
            subStep: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
            state: BankAccount.STATE.SETUP,
            validateCodeExpectedDate: '',
        });
    });

    it('Returns the correct shape for a verifying account', () => {
        const bankAccount = new BankAccount({
            state: BankAccount.STATE.VERIFYING,
        });
        const achData = fetchFreePlanVerifiedBankAccount.buildACHData(bankAccount);
        expect(achData).toEqual({
            useOnfido: true,
            policyID: '',
            isInSetup: false,
            bankAccountInReview: true,
            domainLimit: 0,
            needsToUpgrade: true,
            state: BankAccount.STATE.VERIFYING,
            validateCodeExpectedDate: '',
        });
    });

    it('Returns the correct shape for no account', () => {
        const bankAccount = undefined;
        const achData = fetchFreePlanVerifiedBankAccount.buildACHData(bankAccount);
        expect(achData).toEqual({
            useOnfido: true,
            policyID: '',
            isInSetup: true,
            bankAccountInReview: false,
            domainLimit: 0,
        });
    });
});
