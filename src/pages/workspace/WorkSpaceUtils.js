import lodashGet from 'lodash/get';
import BankAccount from '../../libs/models/BankAccount';
import Navigation from '../../libs/Navigation/Navigation';

function getShouldShowPage(props, nextPage, defaultPage) {
    const state = lodashGet(props.reimbursementAccount, 'achData.state');
    const isShowPage = lodashGet(props.reimbursementAccount, 'achData.bankAccountID') && state !== +BankAccount.STATE.OPEN;
    if (isShowPage) {
       Navigation.navigate(nextPage);
    } else {
        Navigation.navigate(defaultPage);
    }
}

    
export { getShouldShowPage };
