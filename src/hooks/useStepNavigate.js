import {useEffect} from 'react';
import Navigation from '@navigation/Navigation';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

export default function useStepNavigate(reimbursementAccount, onfidoToken = '') {
    const currentStep = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'currentStep', '');
    const shouldShowOnfido = onfidoToken && !getDefaultValueForReimbursementAccountField(reimbursementAccount, 'isOnfidoSetupComplete', false);

    useEffect(() => {
        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                Navigation.navigate(ROUTES.BANK_BUSINESS_INFO);
                break;
            case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
                if (!shouldShowOnfido) {
                    Navigation.navigate(ROUTES.BANK_PERSONAL_INFO);
                    break;
                }
                Navigation.navigate(ROUTES.BANK_VERIFY_IDENTITY);
                break;
            case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
                Navigation.navigate(ROUTES.BANK_COMPANY_OWNER);
                break;
            case CONST.BANK_ACCOUNT.STEP.VALIDATION:
                Navigation.navigate(ROUTES.BANK_COMPLETE_VERIFICATION);
                break;
            case CONST.BANK_ACCOUNT.STEP.ENABLE: // ??
                // Navigation.navigate(ROUTES.BANK_BUSINESS_INFO);
                break;
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            default:
                break;
        }
    }, [currentStep, shouldShowOnfido]);
}
