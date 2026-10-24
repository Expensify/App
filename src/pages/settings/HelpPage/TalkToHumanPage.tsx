import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useNetwork from '@hooks/useNetwork';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';

/**
 * Opens a support ticket straight away, so the Talk to a human link in a Concierge message reaches a
 * person without the customer having to find the row on the Help page.
 */
function TalkToHumanPage() {
    const {openSupportTicketOrConcierge} = useOpenSupportTicket();
    const {isOffline} = useNetwork();
    const navigation = useNavigation();

    // Creating a ticket needs the network, so a customer who opens the link offline lands on the Help page to try again once they are back online.
    const [wasOfflineOnOpen] = useState(isOffline);
    const hasHandledLink = useRef(false);

    useEffect(() => {
        // Stops a second request if this effect runs again while the screen stays mounted.
        if (hasHandledLink.current) {
            return;
        }
        hasHandledLink.current = true;

        // Replace this route so the Help page keeps its own URL, which a ticket opened from it stores as its back target.
        if (wasOfflineOnOpen) {
            Navigation.navigate(ROUTES.SETTINGS_HELP, {forceReplace: true});
            return;
        }

        // Leave this route before creating the ticket. The ticket stores the route it was opened from as its back target,
        // so opening it from here would make Back return to this loader instead of the page the link was pressed on.
        // A direct link has only the Settings sidebar that the split router adds behind it, so there is no page to return
        // to and goBack would skip afterTransition. It falls back to the Help page and opens the ticket from there.
        // A link pressed in the app has a second full screen route under this one, or an earlier page in this Settings split.
        const fullScreenRouteCount = navigationRef.current?.getRootState().routes.filter((route) => !isSideModalNavigator(route.name)).length ?? 0;
        const hasPageToReturnTo = fullScreenRouteCount > 1 || (navigation.getState()?.routes.length ?? 0) > 2;
        Navigation.goBack(hasPageToReturnTo ? undefined : ROUTES.SETTINGS_HELP, {
            afterTransition: () => {
                openSupportTicketOrConcierge();
            },
        });
    }, [wasOfflineOnOpen, navigation, openSupportTicketOrConcierge]);

    return <FullScreenLoadingIndicator />;
}

export default TalkToHumanPage;
