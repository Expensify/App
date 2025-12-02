import {useCardList, useWorkspaceCardList} from '@components/OnyxListItemProvider';
import {getPolicy, getWorkspaceAccountID, isPolicyAdmin} from '@libs/PolicyUtils';
import {getOriginalMessage, isCardIssuedAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportAction} from '@src/types/onyx';

function useGetExpensifyCardFromReportAction({reportAction, policyID}: {reportAction?: ReportAction; policyID?: string}): Card | undefined {
    const allUserCards = useCardList();
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const allExpensifyCards = useWorkspaceCardList();
    const expensifyCards = allExpensifyCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`] ?? {};

    const cardIssuedActionOriginalMessage = isCardIssuedAction(reportAction) ? getOriginalMessage(reportAction) : undefined;

    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return isPolicyAdmin(getPolicy(policyID)) ? expensifyCards?.[cardID] : allUserCards?.[cardID];
}

export default useGetExpensifyCardFromReportAction;
