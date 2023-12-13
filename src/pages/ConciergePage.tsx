import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {Session} from '@src/types/onyx';

type ConciergePageOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ConciergePageProps = ConciergePageOnyxProps;

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage({session}: ConciergePageProps) {
    useFocusEffect(() => {
        if (session?.authToken) {
            // Pop the concierge loading page before opening the concierge report.
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack(ROUTES.HOME);
                Report.navigateToConciergeChat();
            });
        } else {
            Navigation.navigate();
        }
    });

    return <FullScreenLoadingIndicator />;
}
ConciergePage.displayName = 'ConciergePage';

export default withOnyx<ConciergePageProps, ConciergePageOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConciergePage);
