import {getCardSettings} from '@libs/CardUtils';
import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';

import useDefaultFundID from './useDefaultFundID';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * Hook to get the fundID that holds Consolidated Travel Billing for a given policyID.
 * It returns the default fundID unless only the workspace account holds the TRAVEL_US program.
 */
function useTravelBillingFundID(policyID: string | undefined) {
    const defaultFundID = useDefaultFundID(policyID);
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [defaultFundCardSettings] = useOnyx(getTravelBillingCardSettingsKey(defaultFundID));
    const [workspaceCardSettings] = useOnyx(getTravelBillingCardSettingsKey(workspaceAccountID));

    // Setup falls back to the workspace account when the domain already has a card program.
    if (!getCardSettings(defaultFundCardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US) && getCardSettings(workspaceCardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US)) {
        return workspaceAccountID;
    }

    return defaultFundID;
}

export default useTravelBillingFundID;
