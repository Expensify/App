import {isNoSupportRepAvailableResponse, openSupportTicket} from '@libs/actions/Report';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

import useLocalize from './useLocalize';
import useOpenConciergeAnywhere from './useOpenConciergeAnywhere';

/**
 * Returns a callback that opens a support ticket, falling back to Concierge when no support rep is free.
 * Shared by the Help page row and the Talk to a human route so both behave the same.
 */
function useOpenSupportTicket() {
    const {translate} = useLocalize();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();

    const openSupportTicketOrConcierge = () => {
        const request = openSupportTicket();

        // openSupportTicket opens the pending ticket before it resolves, so this is that screen's own route.
        const pendingTicketRoute = Navigation.getActiveRoute();
        request
            .then((response) => {
                if (!isNoSupportRepAvailableResponse(response)) {
                    return;
                }

                Growl.error({bodyText: translate('supportTicket.noSupportRepAvailable')});

                // A ticket that was never created takes its own screen down. Leaving any other screen would pop
                // the page the customer is on instead.
                if (Navigation.getActiveRoute() !== pendingTicketRoute) {
                    openConciergeAnywhere({forceConcierge: true});
                    return;
                }

                Navigation.goBack(undefined, {afterTransition: () => openConciergeAnywhere({forceConcierge: true})});
            })
            .catch(() => undefined);
    };

    return {openSupportTicketOrConcierge};
}

export default useOpenSupportTicket;
