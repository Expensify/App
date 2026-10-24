import {isNoSupportRepAvailableResponse, openSupportTicket} from '@libs/actions/Report';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import useLocalize from './useLocalize';
import useOpenConciergeAnywhere from './useOpenConciergeAnywhere';

/**
 * Returns a callback that opens a support ticket. When no support rep is free it shows the Help page and opens Concierge.
 * Shared by the Help page row and the Talk to a human route so both behave the same.
 */
function useOpenSupportTicket() {
    const {translate} = useLocalize();
    const {openConciergeAnywhere} = useOpenConciergeAnywhere();

    const openSupportTicketOrConcierge = () => {
        openSupportTicket()
            .then((response) => {
                if (!isNoSupportRepAvailableResponse(response)) {
                    return;
                }

                Growl.error({bodyText: translate('supportTicket.noSupportRepAvailable')});
                Navigation.goBack(undefined, {
                    afterTransition: () => {
                        Navigation.navigate(ROUTES.SETTINGS_HELP);
                        openConciergeAnywhere({forceConcierge: true});
                    },
                });
            })
            .catch(() => undefined);
    };

    return {openSupportTicketOrConcierge};
}

export default useOpenSupportTicket;
