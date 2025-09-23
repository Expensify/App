import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import {VERIFY_ACCOUNT} from '@src/ROUTES';

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
