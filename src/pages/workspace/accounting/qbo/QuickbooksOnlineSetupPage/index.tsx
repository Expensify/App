import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useEffect} from 'react';

type QuickbooksOnlineSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_SETUP>;

function QuickbooksOnlineSetupPage({route}: QuickbooksOnlineSetupPageProps) {
    const policyID = route.params.policyID;

    useEffect(() => {
        // On web the connect flow opens the QBO setup link inline (new tab), so this screen has no content. It is
        // only reached via a deep link, so just return to the workspace accounting page. We wait for the RHP open
        // transition to finish first, otherwise goBack fires mid-transition and is dropped.
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID)),
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [policyID]);

    return null;
}

export default QuickbooksOnlineSetupPage;
