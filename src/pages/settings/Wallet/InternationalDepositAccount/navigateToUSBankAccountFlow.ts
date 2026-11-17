import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

/**
 * US bank accounts are added with Plaid or by hand, not through the international flow, so a US pick on its country list opens the US flow.
 * That flow adds an account only for a verified user, so anyone else gets the magic code first and is sent on to it afterwards.
 */
function navigateToUSBankAccountFlow(isUserValidated: boolean | undefined) {
    if (isUserValidated) {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ADD_US_BANK_ACCOUNT_ENTRY_POINT.path, ROUTES.SETTINGS_WALLET));
        return;
    }
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.VERIFY_ACCOUNT.path));
}

export default navigateToUSBankAccountFlow;
