import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function navigateFromAddPaymentCardItem() {
    return Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
}

export default navigateFromAddPaymentCardItem;
