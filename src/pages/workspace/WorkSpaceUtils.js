import lodashGet from 'lodash/get';
import BankAccount from '../../libs/models/BankAccount'; 
import Navigation from '../../libs/Navigation/Navigation';
/**
* If we have an open bank account or no bank account at all then we will immediately redirect the user to /bank-account to display the next step
*
* @returns {Boolean}
*/
function getShouldShowPage(props, nextPage, defaultPage) {
    const state = lodashGet(props.reimbursementAccount, 'achData.state');
    const isShowPage =  lodashGet(props.reimbursementAccount, 'achData.bankAccountID') && state !== +BankAccount.STATE.OPEN;
    if (isShowPage) {
       Navigation.navigate(nextPage)
    } else {
        Navigation.navigate(defaultPage)
    }
}  

export {
    getShouldShowPage,
};
