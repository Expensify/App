import {useCardList, useWorkspaceCardList} from '@components/OnyxListItemProvider';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getOriginalMessage, isCardIssuedAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportAction} from '@src/types/onyx';
import usePolicy from './usePolicy';

function useGetExpensifyCardFromReportAction({reportAction, policyID}: {reportAction?: ReportAction; policyID?: string}): Card | undefined {
    const allUserCards = useCardList();
    const allExpensifyCards = useWorkspaceCardList();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const cardIssuedActionOriginalMessage = isCardIssuedAction(reportAction) ? getOriginalMessage(reportAction) : undefined;
    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    if (!isPolicyAdmin(policy)) {
        return allUserCards?.[cardID];
    }

    // Issued Expensify Cards live on one of two Onyx keys: regular cards on the 2-segment key,
    // Travel Invoicing cards on the `_TRAVEL_US` variant. Check both.
    return (
        allExpensifyCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`]?.[cardID] ??
        allExpensifyCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`]?.[cardID]
    );
}

export default useGetExpensifyCardFromReportAction;
