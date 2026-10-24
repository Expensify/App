import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useNetwork from '@hooks/useNetwork';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

import React, {useEffect, useRef, useState} from 'react';

import HelpPage from './HelpPage';

/**
 * Opens a support ticket straight away, so the Talk to a human link in a Concierge message reaches a
 * person without the customer having to find the row on the Help page.
 */
function TalkToHumanPage() {
    const {openSupportTicketOrConcierge} = useOpenSupportTicket();
    const {isOffline} = useNetwork();

    // Creating a ticket needs the network, so a customer who opens the link offline gets the Help page to try again once they are back online.
    const [wasOfflineOnOpen] = useState(isOffline);
    const hasRequestedTicket = useRef(false);

    useEffect(() => {
        // Stops a second request if this effect runs again while the screen stays mounted.
        if (wasOfflineOnOpen || hasRequestedTicket.current) {
            return;
        }
        hasRequestedTicket.current = true;

        // Leave this route before creating the ticket. The ticket stores the route it was opened from as its back target,
        // so opening it from here would make Back return to this loader instead of the chat the link was pressed in.
        // A link pressed in the app pushes a second full screen route under this one. A direct link only has the Settings
        // sidebar that the split router adds behind it, so there is no page to return to and goBack would skip afterTransition.
        // It falls back to the Help page and opens the ticket from there.
        const fullScreenRouteCount = navigationRef.current?.getRootState().routes.filter((route) => !isSideModalNavigator(route.name)).length ?? 0;
        const fallbackRoute = fullScreenRouteCount > 1 ? undefined : ROUTES.SETTINGS_HELP;
        Navigation.goBack(fallbackRoute, {
            afterTransition: () => {
                openSupportTicketOrConcierge();
            },
        });
    }, [wasOfflineOnOpen, openSupportTicketOrConcierge]);

    if (wasOfflineOnOpen) {
        return <HelpPage />;
    }

    return <FullScreenLoadingIndicator />;
}

export default TalkToHumanPage;
