import {useEffect} from 'react';
import useEnvironment from '@hooks/useEnvironment';
import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {openLink} from '@userActions/Link';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type QuickbooksOnlineSetupPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_SETUP>;

function QuickbooksOnlineSetupPage({route}: QuickbooksOnlineSetupPageProps) {
    const {environmentURL} = useEnvironment();
    const policyID = route.params.policyID;

    useEffect(() => {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        enablePolicyTaxes(policyID, false);
        openLink(getQuickbooksOnlineSetupLink(policyID), environmentURL);

        // On web the link opens in a new tab and this page renders nothing, so close the RHP and return to the
        // accounting page instead of leaving an empty backdrop behind (falls back to it on a deep link with no history).
        // We wait for the RHP open transition to finish first, otherwise goBack fires mid-transition and is dropped,
        // leaving the user stuck on the empty backdrop.
        const transitionHandle = Navigation.runAfterUpcomingTransition(() => {
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
        });
        return () => transitionHandle.cancel();
    }, [policyID, environmentURL]);

    return null;
}

export default QuickbooksOnlineSetupPage;
