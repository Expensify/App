import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

// Adding payment card is currently only available on web.
function navigateToSubscriptionPayment() {
    Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route);
}

export default navigateToSubscriptionPayment;
