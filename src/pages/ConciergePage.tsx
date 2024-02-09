import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Session} from '@src/types/onyx';

type ConciergePageOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

type ConciergePageProps = ConciergePageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.CONCIERGE>;

/*
 * This is a "utility page", that does this:
 *     - If the user is authenticated, find their concierge chat and re-route to it
 *     - Else re-route to the login page
 */
function ConciergePage({session}: ConciergePageProps) {
    useFocusEffect(() => {
        if (session && 'authToken' in session) {
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
