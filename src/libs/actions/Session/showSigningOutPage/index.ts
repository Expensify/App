import resetSigningOutContentShown from '@libs/actions/resetSigningOutContentShown';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type ShowSigningOutPage from './types';

/**
 * Reset signing out content and navigate to the signing out page
 */
const showSigningOutPage: ShowSigningOutPage = () => {
    // Reset storage related to the signing out loading state
    resetSigningOutContentShown();

    Navigation.navigate(ROUTES.SIGNING_OUT as Route);
};

export default showSigningOutPage;
