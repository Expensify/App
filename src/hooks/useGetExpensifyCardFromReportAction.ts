import {useCardList, useWorkspaceCardList} from '@components/OnyxListItemProvider';

import {getExpensifyCardFromReportAction} from '@libs/ReportAlternateTextUtils';

import type {Card, ReportAction} from '@src/types/onyx';

import usePolicy from './usePolicy';

function useGetExpensifyCardFromReportAction({reportAction, policyID}: {reportAction?: ReportAction; policyID?: string}): Card | undefined {
    const allUserCards = useCardList();
    const allExpensifyCards = useWorkspaceCardList();
    const policy = usePolicy(policyID);

    return getExpensifyCardFromReportAction({reportAction, policy, cardList: allUserCards, workspaceCardList: allExpensifyCards});
}

export default useGetExpensifyCardFromReportAction;
