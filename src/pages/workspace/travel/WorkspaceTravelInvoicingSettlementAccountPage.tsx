import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceSettlementAccountPage from '@pages/workspace/expensifyCard/WorkspaceSettlementAccountPage';
import type SCREENS from '@src/SCREENS';

type WorkspaceTravelInvoicingSettlementAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT>;

/**
 * Wrapper component that renders WorkspaceSettlementAccountPage with isTravelInvoicing=true.
 * This allows the settlement account page to be reused for both Expensify Card and Travel Invoicing flows.
 */
function WorkspaceTravelInvoicingSettlementAccountPage(props: WorkspaceTravelInvoicingSettlementAccountPageProps) {
    return (
        <WorkspaceSettlementAccountPage
            // eslint-disable-next-line react/jsx-props-no-spreading -- Wrapper component forwarding navigation props unchanged
            {...props}
            isTravelInvoicing
        />
    );
}

export default WorkspaceTravelInvoicingSettlementAccountPage;
