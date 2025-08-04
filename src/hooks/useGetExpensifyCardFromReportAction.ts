import {getPolicy, getWorkspaceAccountID, isPolicyAdmin} from '@libs/PolicyUtils';
import {getOriginalMessage, isCardIssuedAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportAction} from '@src/types/onyx';
import useOnyx from './useOnyx';

function useGetExpensifyCardFromReportAction({reportAction, policyID}: {reportAction?: ReportAction; policyID?: string}): Card | undefined {
    const [allUserCards] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [allExpensifyCards] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {
        selector: (val) => {
            const workspaceAccountID = getWorkspaceAccountID(policyID);
            return val?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`] ?? {};
        },
        canBeMissing: true,
    });
    const cardIssuedActionOriginalMessage = isCardIssuedAction(reportAction) ? getOriginalMessage(reportAction) : undefined;

    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    return isPolicyAdmin(getPolicy(policyID)) ? allExpensifyCards?.[cardID] : allUserCards?.[cardID];
}

export default useGetExpensifyCardFromReportAction;
