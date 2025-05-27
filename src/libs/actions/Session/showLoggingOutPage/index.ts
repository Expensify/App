import resetLoggingOutContentShown from '@libs/actions/LoggingOut';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type ShowLoggingOutPage from './types';

/**
 * Reset logging out content and navigate to the logging out page
 */
const showLoggingOutPage: ShowLoggingOutPage = () => {
    // Reset storage related to the logging out loading state
    resetLoggingOutContentShown();

    Navigation.navigate(ROUTES.LOGGING_OUT);
};

export default showLoggingOutPage;
