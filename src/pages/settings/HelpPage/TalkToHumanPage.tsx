import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useNetwork from '@hooks/useNetwork';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import getFullScreenRootRouteCount from '@libs/Navigation/helpers/getFullScreenRootRouteCount';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';

/**
 * Opens a support ticket straight away, so the Talk to a human link in a Concierge message reaches a
 * person without the customer having to find the row on the Help page.
 */
function TalkToHumanPage() {
    const {openSupportTicketOrConcierge} = useOpenSupportTicket();
    const {isOffline} = useNetwork();
    const navigation = useNavigation();
    const hasHandledLink = useRef(false);

    useEffect(() => {
        if (hasHandledLink.current) {
            return;
        }
        hasHandledLink.current = true;

        // Leave this route first, because the ticket stores the route it opens from as its Back target.
        // A direct link has only the injected Settings sidebar behind it, so fall back to the Help page.
        const hasPageToReturnTo = getFullScreenRootRouteCount(navigationRef.current?.getRootState()) > 1 || (navigation.getState()?.routes.length ?? 0) > 2;

        // Creating a ticket needs the network, so offline the customer gets the Help page to retry from instead.
        Navigation.goBack(hasPageToReturnTo ? undefined : ROUTES.SETTINGS_HELP, {
            afterTransition: isOffline ? () => Navigation.navigate(ROUTES.SETTINGS_HELP) : openSupportTicketOrConcierge,
        });
    }, [isOffline, navigation, openSupportTicketOrConcierge]);

    return <FullScreenLoadingIndicator />;
}

export default TalkToHumanPage;
