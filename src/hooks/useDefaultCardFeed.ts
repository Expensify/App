import type {CardProgramKey} from '@libs/CardUtils';
import {
    getCardSettings,
    getConfiguredExpensifyCardProgramKeys,
    getFundIdFromSettingsKey,
    getLinkedPolicyIDsFromExpensifyCardSettings,
    getPreferredPolicyFromExpensifyCardSettings,
    isPolicyIDInLinkedExpensifyCardPolicyList,
    parseCardFeedKey,
} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useCallback} from 'react';

import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

type DefaultCardFeed = {
    /** The fund whose settings and cards the workspace's Expensify Card pages should show */
    fundID: number;

    /** Which of the fund's programs (US/GB) to display, since one fund's settings can hold both */
    programKey: CardProgramKey;
};

/**
 * Hook to get the default card feed for a given policyID: the fundID used to look up settings and cards, paired with the
 * program (US/GB) to display from that fund. A single fund's settings can hold both programs, whose cards share one Onyx
 * list, so the fund alone is not enough to identify which cards/currency/settings to show.
 *
 * The fund is taken from `LAST_SELECTED_EXPENSIFY_CARD_FEED` when that feed still has a settlement account and is not
 * pending deletion, otherwise it falls back to a domain fund linked to the policy, then to the workspace fund.
 *
 * The program is read from the `fundID_programKey` composite stored in `LAST_SELECTED_EXPENSIFY_CARD_FEED`, and is honored
 * only while that program is still configured on the fund being returned. Once it is gone (or nothing is stored yet, e.g. a
 * value saved before the program was persisted with the feed) it falls back to the fund's first configured program (US
 * before GB) so a fund that only has a GB program still shows its cards, while a US (or single-program) fund keeps
 * behaving exactly as before.
 */
function useDefaultCardFeed(policyID: string | undefined): DefaultCardFeed {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`);
    const {fundID: lastSelectedFundID, programKey: lastSelectedProgramKey} = parseCardFeedKey(lastSelectedExpensifyCardFeed);
    const [lastSelectedCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${lastSelectedFundID}`);
    // A feed key saved before programs were persisted alongside the fund carries no program, so fall back to the fund's
    // first configured program to find the settlement account that decides whether the feed is still usable.
    const lastSelectedFeedProgramKey = lastSelectedProgramKey ?? getConfiguredExpensifyCardProgramKeys(lastSelectedCardSettings).at(0);
    const lastSelectedProgramSettings = lastSelectedFeedProgramKey ? getCardSettings(lastSelectedCardSettings, lastSelectedFeedProgramKey) : lastSelectedCardSettings;

    const getDomainFundID = useCallback(
        (cardSettings: OnyxCollection<ExpensifyCardSettings>) => {
            // Compare the parsed fund ID rather than testing the raw key for a substring: a substring test
            // also excludes unrelated funds whose ID merely contains these digits, and while the workspace
            // fund is still unresolved it holds CONST.DEFAULT_NUMBER_ID, which would drop every fund whose
            // ID contains a zero.
            const eligibleEntries = Object.entries(cardSettings ?? {}).filter(
                ([key, settings]) => !!settings && getFundIdFromSettingsKey(key) !== workspaceAccountID && settings.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            );

            if (policyID) {
                const preferredMatch = eligibleEntries.find(([, settings]) => getPreferredPolicyFromExpensifyCardSettings(settings)?.toUpperCase() === policyID.toUpperCase());
                if (preferredMatch) {
                    return getFundIdFromSettingsKey(preferredMatch[0]);
                }

                const linkedMatch = eligibleEntries.find(([, settings]) => isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsFromExpensifyCardSettings(settings), policyID));
                if (linkedMatch) {
                    return getFundIdFromSettingsKey(linkedMatch[0]);
                }
            }

            return undefined;
        },
        [policyID, workspaceAccountID],
    );

    const [domainFundID] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: getDomainFundID,
    });

    const isFeedPendingDelete = lastSelectedCardSettings?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isLastSelectedFeedUsable = !!lastSelectedFundID && !!lastSelectedProgramSettings?.paymentBankAccountID && !isFeedPendingDelete;
    // `useWorkspaceAccountID` reports an unresolved workspace as CONST.DEFAULT_NUMBER_ID, so it is only a usable fund when
    // truthy — otherwise it is the same placeholder this falls back to anyway.
    const resolvedWorkspaceFundID = workspaceAccountID || undefined;
    const fundID = (isLastSelectedFeedUsable ? lastSelectedFundID : undefined) ?? domainFundID ?? resolvedWorkspaceFundID ?? CONST.DEFAULT_NUMBER_ID;

    // Resolve the program against the fund actually being returned: when the last-selected feed is unusable the fallbacks
    // above point at a different fund, whose configured programs need not include the last-selected one.
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`);
    const configuredProgramKeys = getConfiguredExpensifyCardProgramKeys(cardSettings);
    const storedProgramKey = configuredProgramKeys.find((key) => key === lastSelectedProgramKey);

    return {fundID, programKey: storedProgramKey ?? configuredProgramKeys.at(0) ?? CONST.COUNTRY.US};
}

export default useDefaultCardFeed;
export type {DefaultCardFeed};
