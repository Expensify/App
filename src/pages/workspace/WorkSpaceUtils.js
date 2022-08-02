import lodashGet from 'lodash/get';
import BankAccount from '../../libs/models/BankAccount';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

function getShouldShowBankOrNonAccountPage(reimbursementAccount, policyID) {
    const state = lodashGet(reimbursementAccount, 'achData.state');
    const isShowPage = lodashGet(reimbursementAccount, 'achData.bankAccountID') && state !== +BankAccount.STATE.OPEN;
    if (isShowPage) {
        Navigation.navigate(ROUTES.getWorkspaceBankAccountRoute(policyID));
    } else {
        Navigation.navigate(ROUTES.getBankAccountRoute());
    }
}

export {getShouldShowBankOrNonAccountPage};
