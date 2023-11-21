import lodashGet from 'lodash/get';
import {useEffect} from 'react';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

export default function useStepNavigate(reimbursementAccount, onfidoToken = '') {
    const currentStep = lodashGet(reimbursementAccount, ['achData', 'currentStep'], '');
    const shouldShowOnfido = onfidoToken && !lodashGet(reimbursementAccount, ['achData', 'isOnfidoSetupComplete'], false);

    useEffect(() => {
        switch (currentStep) {
            case CONST.BANK_ACCOUNT.STEP.COMPANY:
                // maybe we should also save different current step in BE as well here
                Navigation.navigate(ROUTES.BANK_BUSINESS_INFO);
                return;
            case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
                if (!shouldShowOnfido) {
                    Navigation.navigate(ROUTES.BANK_PERSONAL_INFO);
                    return;
                }
                Navigation.navigate(ROUTES.BANK_VERIFY_IDENTITY);
                return;
            case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
                Navigation.navigate(ROUTES.BANK_COMPANY_OWNER);
                return;
            case CONST.BANK_ACCOUNT.STEP.VALIDATION:
                Navigation.navigate(ROUTES.BANK_COMPLETE_VERIFICATION);
                return;
            case CONST.BANK_ACCOUNT.STEP.ENABLE: // ??
                // Navigation.navigate(ROUTES.BANK_BUSINESS_INFO);
                return;
            case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            default:
                Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute());
        }
    }, [currentStep, shouldShowOnfido]);
}
