import lodashGet from 'lodash/get';
import BankAccount from '../../libs/models/BankAccount';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

/**
 * Navigate Bank Account Route
 *
 * @param {String} reimbursementAccount
 * @param {String} policyID
 */
function navigateToBankAccountRoute(reimbursementAccount, policyID) {
    const state = lodashGet(reimbursementAccount, 'achData.state');
    const isShowPage = lodashGet(reimbursementAccount, 'achData.bankAccountID') && state !== BankAccount.STATE.OPEN;
    if (isShowPage) {
        Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policyID));
    } else {
        Navigation.navigate(ROUTES.getBankAccountRoute());
    }
}

export default navigateToBankAccountRoute;
