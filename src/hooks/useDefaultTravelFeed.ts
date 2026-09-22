import {getCardSettings, getFundIdFromSettingsKey, getLinkedPolicyIDsForExpensifyCardProgram, isPolicyIDInLinkedExpensifyCardPolicyList} from '@libs/CardUtils';
import {getIsTravelBillingPayByInvoice, hasTravelBillingSettlementAccount} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback} from 'react';

import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

type DefaultTravelFeed = {
    fundID: number;
    programKey: typeof CONST.TRAVEL.PROGRAM_TRAVEL_US;
};

/** Resolves the Travel Billing feed linked or preferred for a workspace, falling back to the workspace's own fund. */
function useDefaultTravelFeed(policyID: string | undefined): DefaultTravelFeed {
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const getDomainTravelFundID = useCallback(
        (cardSettingsCollection: OnyxCollection<ExpensifyCardSettings>) => {
            if (!policyID) {
                return undefined;
            }

            const candidates = Object.entries(cardSettingsCollection ?? {}).flatMap(([settingsKey, settings]) => {
                if (!settings || settings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return [];
                }

                const fundID = getFundIdFromSettingsKey(settingsKey);
                if (fundID === workspaceAccountID) {
                    return [];
                }

                const travelSettings = getCardSettings(settings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
                if (!hasTravelBillingSettlementAccount(travelSettings) && !getIsTravelBillingPayByInvoice(travelSettings)) {
                    return [];
                }

                return [{fundID, settings, travelSettings}];
            });

            const preferredMatch = candidates.find((candidate) => candidate.travelSettings?.preferredPolicy?.toUpperCase() === policyID.toUpperCase());
            if (preferredMatch) {
                return preferredMatch.fundID;
            }

            return candidates.find((candidate) =>
                isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsForExpensifyCardProgram(candidate.settings, CONST.TRAVEL.PROGRAM_TRAVEL_US), policyID),
            )?.fundID;
        },
        [policyID, workspaceAccountID],
    );

    const [domainTravelFundID] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {selector: getDomainTravelFundID});
    const fundID = (domainTravelFundID ?? workspaceAccountID) || CONST.DEFAULT_NUMBER_ID;

    return {fundID, programKey: CONST.TRAVEL.PROGRAM_TRAVEL_US};
}

export default useDefaultTravelFeed;
