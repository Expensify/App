import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReimbursementAccountNavigatorParamList} from '@libs/Navigation/types';
import {REIMBURSEMENT_ACCOUNT_ROUTE_NAMES} from '@libs/ReimbursementAccountUtils';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {BankAccountStep as TBankAccountStep} from '@src/types/onyx/ReimbursementAccount';

/**
 * We can pass stepToOpen in the URL to force which step to show.
 * Mainly needed when user finished the flow in verifying state, and Ops ask them to modify some fields from a specific step.
 */
function getStepToOpenFromRouteParams(
    route: PlatformStackRouteProp<ReimbursementAccountNavigatorParamList, typeof SCREENS.REIMBURSEMENT_ACCOUNT_ROOT>,
    hasConfirmedUSDCurrency: boolean,
): TBankAccountStep | '' {
    switch (route.params.stepToOpen) {
        case REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW:
            return hasConfirmedUSDCurrency ? CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT : CONST.BANK_ACCOUNT.STEP.COUNTRY;
        case REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.COMPANY:
            return CONST.BANK_ACCOUNT.STEP.COMPANY;
        case REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.PERSONAL_INFORMATION:
            return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
        case REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.BENEFICIAL_OWNERS:
            return CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS;
        case REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.CONTRACT:
            return CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT;
        case REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.VALIDATE:
            return CONST.BANK_ACCOUNT.STEP.VALIDATION;
        case REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.ENABLE:
            return CONST.BANK_ACCOUNT.STEP.ENABLE;
        default:
            return '';
    }
}

export default getStepToOpenFromRouteParams;
