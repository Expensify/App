import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useNetwork from '@hooks/useNetwork';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';

import React, {useEffect, useRef} from 'react';

/**
 * Opens a support ticket straight away, so the Talk to a human link in a Concierge message reaches a
 * person without the customer having to find the row on the Help page.
 */
function TalkToHumanPage() {
    const {openSupportTicketOrConcierge} = useOpenSupportTicket();
    const {isOffline} = useNetwork();
    const hasRequestedTicket = useRef(false);

    useEffect(() => {
        // Creating a ticket needs the network, so send the customer to the Help page to try again once they are back online.
        if (isOffline) {
            Navigation.goBack(ROUTES.SETTINGS_HELP);
            return;
        }

        // A remount would otherwise open a second ticket that a support rep has to close.
        if (hasRequestedTicket.current) {
            return;
        }
        hasRequestedTicket.current = true;

        // Leave this route before creating the ticket. The ticket stores the route it was opened from as its back target,
        // so opening it from here would make Back return to this loader instead of the chat the link was pressed in.
        // A direct link has nothing behind it to return to and goBack would then skip afterTransition, so it falls back
        // to the Help page and opens the ticket from there.
        const fallbackRoute = navigationRef.current?.canGoBack() ? undefined : ROUTES.SETTINGS_HELP;
        Navigation.goBack(fallbackRoute, {
            afterTransition: () => {
                openSupportTicketOrConcierge();
            },
        });

        // openSupportTicketOrConcierge is a new function on every render and hasRequestedTicket already stops a second
        // request, so this effect only needs to react to the connection changing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    return <FullScreenLoadingIndicator />;
}

export default TalkToHumanPage;
