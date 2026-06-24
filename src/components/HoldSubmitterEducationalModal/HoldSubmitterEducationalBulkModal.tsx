import React from 'react';
import useNetwork from '@hooks/useNetwork';
import {setNameValuePair} from '@libs/actions/User';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import BaseHoldSubmitterEducationalModal from './BaseHoldSubmitterEducationalModal';

function HoldSubmitterEducationalBulkModal() {
    const {isOffline} = useNetwork();

    const handleDismiss = () => {
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !isOffline);

        const activeRoute = Navigation.getActiveRoute();
        const searchBaseRoute = getPathWithoutDynamicSuffix(activeRoute, DYNAMIC_ROUTES.HOLD_EDUCATIONAL_BULK.path);
        Navigation.goBack(undefined, {
            afterTransition: () => {
                Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_SEARCH.getRoute(searchBaseRoute || undefined));
            },
        });
    };

    return <BaseHoldSubmitterEducationalModal onDismiss={handleDismiss} />;
}

export default HoldSubmitterEducationalBulkModal;
