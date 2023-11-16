import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

function handleStepSelected(step) {
    if (step === '1') {
        Navigation.navigate(ROUTES.BANK_BANK_INFO);
    }

    if (step === '2') {
        Navigation.navigate(ROUTES.BANK_BUSINESS_INFO);
    }

    if (step === '3') {
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
