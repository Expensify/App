import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect} from 'react';

function EarlyRenewalOfferPage() {
    useEffect(() => {
        Navigation.closeRHPFlow();
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route);
    }, []);

    return null;
}

export default EarlyRenewalOfferPage;
