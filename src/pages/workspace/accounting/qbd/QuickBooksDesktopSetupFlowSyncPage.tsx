import {useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isConnectionInProgress, syncConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type QuickBooksDesktopSetupFlowSyncPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL>;

function QuickBooksDesktopSetupFlowSyncPage({route}: QuickBooksDesktopSetupFlowSyncPageProps) {
    const policyID: string = route.params.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID ?? '-1'}`);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID ?? '-1'}`);

    useEffect(() => {
        if (!policyID) {
            return;
        }

        const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
        if (!isSyncInProgress) {
            syncConnection(policy, CONST.POLICY.CONNECTIONS.NAME.QBD, true);
        }

        Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING.getRoute(policyID));

        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return null;
}

QuickBooksDesktopSetupFlowSyncPage.displayName = 'QuickBooksDesktopSetupFlowSyncPage';

export default QuickBooksDesktopSetupFlowSyncPage;
