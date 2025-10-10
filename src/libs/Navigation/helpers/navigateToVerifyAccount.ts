import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import {VERIFY_ACCOUNT} from '@src/ROUTES';

// This function adds /verify-account to the current URL and redirects to it
// In the future, this function will also handle dynamic redirects to other components
const navigateToVerifyAccount = () => {
    const activeRoute = Navigation.getActiveRoute();
    const [path, params] = activeRoute.split('?');
    let verifyAccountRoute = path.endsWith('/') ? `${path}${VERIFY_ACCOUNT}` : `${path}/${VERIFY_ACCOUNT}`;
    if (params) {
        verifyAccountRoute += `?${params}`;
    }
    Navigation.navigate(verifyAccountRoute as Route);
};

export default navigateToVerifyAccount;
