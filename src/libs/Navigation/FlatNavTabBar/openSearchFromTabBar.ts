import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {startNavigateToReportsTabSpans} from '@libs/telemetry/startTabNavigationSpans';

import type {Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Opens a search from the flat nav tab bar or its More menu. Anonymous users get the sign-in instead, and the Spend
 * navigation spans start only when Search is opened from another tab, as the Spend tab starts them.
 */
function openSearchFromTabBar(navigateToSearch: () => void, isSearchFocused: boolean, session: OnyxEntry<Session>) {
    interceptAnonymousUser(() => {
        if (!isSearchFocused) {
            startNavigateToReportsTabSpans();
        }
        navigateToSearch();
    }, session);
}

export default openSearchFromTabBar;
