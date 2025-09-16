import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';

const navigateToVerifyAccount = () => {
    const activeRoute = Navigation.getActiveRoute();
    const [path, params] = activeRoute.split('?');
    let verifyAccountRoute = path.endsWith('/') ? `${path}verify-account` : `${path}/verify-account`;
    if (params) {
        verifyAccountRoute += `?${params}`;
    }
    Navigation.navigate(verifyAccountRoute as Route);
};

export default navigateToVerifyAccount;
