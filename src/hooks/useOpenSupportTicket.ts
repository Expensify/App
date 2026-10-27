import {isNoSupportRepAvailableResponse, openSupportTicket} from '@libs/actions/Report';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';

import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useOpenConciergeAnywhere from './useOpenConciergeAnywhere';

/**
 * Returns a callback that opens a support ticket, falling back to Concierge when no support rep is free.
 * Shared by the Help page row and the Talk to a human route so both behave the same.
 */
function useOpenSupportTicket() {
    const {translate} = useLocalize();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const openConcierge = () => {
        // The customer is already in the Concierge chat, so opening it again would show it twice.
        if (conciergeReportID && Navigation.getFocusedReportId() === conciergeReportID) {
            return;
        }
        openConciergeAnywhere({forceConcierge: true});
    };

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
                    openConcierge();
                    return;
                }

                Navigation.goBack(undefined, {afterTransition: openConcierge});
            })
            .catch(() => undefined);
    };

    return {openSupportTicketOrConcierge};
}

export default useOpenSupportTicket;
