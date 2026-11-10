/** Keep the selected window separate from the cached history used for pagination and lookups. */
import {getContinuousChain} from '@libs/PaginationUtils';

import type {Pages, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type GetReportActionsPageParams = {
    cachedActions: ReportAction[] | undefined;
    pages: OnyxEntry<Pages>;
    linkedActionID: string | undefined;
    initialLastReadTime: string | undefined;
    shouldLinkToUnread: boolean;
    shouldIgnoreAnchor: boolean;
};

function getReportActionsPage({cachedActions, pages, linkedActionID, initialLastReadTime, shouldLinkToUnread, shouldIgnoreAnchor}: GetReportActionsPageParams) {
    const anchorID = shouldIgnoreAnchor
        ? undefined
        : linkedActionID || (shouldLinkToUnread && initialLastReadTime ? cachedActions?.findLast((action) => action.created > initialLastReadTime)?.reportActionID : undefined);
    const chain = cachedActions?.length
        ? getContinuousChain(cachedActions, pages ?? [], (action) => action.reportActionID, anchorID)
        : {data: [], hasNextPage: false, hasPreviousPage: false, resourceItem: undefined};

    return {
        pageActions: chain.data,
        hasOlderActions: chain.hasNextPage,
        hasNewerActions: chain.hasPreviousPage,
        oldestUnreadReportAction: !shouldIgnoreAnchor && shouldLinkToUnread && !linkedActionID ? chain.resourceItem?.item : undefined,
    };
}

export default getReportActionsPage;
