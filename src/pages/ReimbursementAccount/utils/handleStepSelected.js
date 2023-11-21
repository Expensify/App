import Navigation from '@navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function handleStepSelected(step) {
    if (step === '1') {
        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
        Navigation.navigate(ROUTES.BANK_BANK_INFO);
    }

    if (step === '2') {
        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY);
        Navigation.navigate(ROUTES.BANK_BUSINESS_INFO);
    }

    if (step === '3') {
        BankAccounts.clearOnfidoToken();
        BankAccounts.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR);
        Navigation.navigate(ROUTES.BANK_PERSONAL_INFO);
    }

    if (step === '4') {
        Navigation.navigate(ROUTES.BANK_VERIFY_IDENTITY);
    }

    if (step === '5') {
        Navigation.navigate(ROUTES.BANK_COMPANY_OWNER);
    }
}

export default handleStepSelected;
