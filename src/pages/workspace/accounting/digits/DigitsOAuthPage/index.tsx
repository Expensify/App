/**
 * The Digits sign-in route on web. The connect flow opens the sign-in in a new tab, so this route is only reached from a
 * deep link, and it goes straight back to the workspace's Connections page.
 */
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useEffect} from 'react';

type DigitsOAuthPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DIGITS_OAUTH>;

function DigitsOAuthPage({route}: DigitsOAuthPageProps) {
    const policyID = route.params.policyID;

    useEffect(() => {
        // Wait for the RHP open transition to finish first, otherwise goBack fires mid-transition and is dropped
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID)),
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [policyID]);

    return null;
}

export default DigitsOAuthPage;
