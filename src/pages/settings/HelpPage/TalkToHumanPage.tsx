import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useNetwork from '@hooks/useNetwork';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import Navigation from '@libs/Navigation/Navigation';

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
        openSupportTicketOrConcierge();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    return <FullScreenLoadingIndicator shouldUseGoBackButton={false} />;
}

TalkToHumanPage.displayName = 'TalkToHumanPage';

export default TalkToHumanPage;
