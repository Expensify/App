import {useCardList, useWorkspaceCardList} from '@components/OnyxListItemProvider';
import {getWorkspaceAccountID, isPolicyAdmin} from '@libs/PolicyUtils';
import {getOriginalMessage, isCardIssuedAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportAction} from '@src/types/onyx';
import usePolicy from './usePolicy';

function useGetExpensifyCardFromReportAction({reportAction, policyID}: {reportAction?: ReportAction; policyID?: string}): Card | undefined {
    const allUserCards = useCardList();
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const allExpensifyCards = useWorkspaceCardList();
    const policy = usePolicy(policyID);
    const expensifyCards = allExpensifyCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`] ?? {};

    const cardIssuedActionOriginalMessage = isCardIssuedAction(reportAction) ? getOriginalMessage(reportAction) : undefined;

    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    return isPolicyAdmin(policy) ? expensifyCards?.[cardID] : allUserCards?.[cardID];
}

export default useGetExpensifyCardFromReportAction;
