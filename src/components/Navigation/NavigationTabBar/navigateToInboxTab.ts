import Navigation from '@libs/Navigation/Navigation';
import {startNavigateToInboxTabSpan} from '@libs/telemetry/startTabNavigationSpans';

import ROUTES from '@src/ROUTES';

/** Opens the Inbox tab at its chat list from the narrow tab bar, whatever report was left open in it. */
function navigateToInboxTab() {
    startNavigateToInboxTabSpan({isWideLayout: false});
    Navigation.navigate(ROUTES.INBOX);
}

export default navigateToInboxTab;
