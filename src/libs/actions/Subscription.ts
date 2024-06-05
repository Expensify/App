import * as API from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

/**
 * Fetches data when the user opens the SubscriptionSettingsPage
 */
function openSubscriptionPage() {
    API.read(READ_COMMANDS.OPEN_SUBSCRIPTION_PAGE, null);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    openSubscriptionPage,
};
