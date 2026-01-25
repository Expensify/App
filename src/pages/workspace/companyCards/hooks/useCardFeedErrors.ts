import type {CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useCompanyCards from '@hooks/useCompanyCards';
import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {checkIfFeedConnectionIsBroken, flatAllCardsList, getCompanyCardFeed, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type UseCompanyCardFeedErrorsProps = {
    policyID: string | undefined;
    feedName?: CompanyCardFeedWithDomainID;
};

type CompanyCardFeedErrors = {
    shouldShowRBR: boolean;
    hasFailedCardAssignments: boolean;
    hasFeedError: boolean;
    isFeedConnectionBroken: boolean;
};

type UseCompanyCardFeedErrorsResult = CompanyCardFeedErrors & {
    getCardFeedErrors: (feedName: CompanyCardFeedWithDomainID) => CompanyCardFeedErrors;
};

function useCompanyCardFeedErrors({policyID, feedName}: UseCompanyCardFeedErrorsProps): UseCompanyCardFeedErrorsResult {
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const {companyCardFeeds} = useCompanyCards({policyID, feedName});
    const [allFeedsCards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const [failedCompanyCardAssignmentsPerFeed] = useOnyx(ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS, {canBeMissing: true});

    const getCardFeedErrors = (feedNameFn: CompanyCardFeedWithDomainID | undefined): CompanyCardFeedErrors => {
        const bankName = getCompanyCardFeed(feedNameFn);
        const selectedFeed = bankName && companyCardFeeds?.[bankName];
        const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed);

        const hasFailedCardAssignments = !isEmptyObject(
            failedCompanyCardAssignmentsPerFeed?.[`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}_${feedNameFn ?? ''}`],
        );
        const hasFeedError = feedNameFn ? !!selectedFeed?.errors : false;
        const isFeedConnectionBroken = checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, domainOrWorkspaceAccountID), feedNameFn);

        const shouldShowRBR = hasFailedCardAssignments || hasFeedError || isFeedConnectionBroken;

        return {
            shouldShowRBR,
            hasFailedCardAssignments,
            hasFeedError,
            isFeedConnectionBroken,
        };
    };

    return {
        ...getCardFeedErrors(feedName),
        getCardFeedErrors,
    };
}

export default useCompanyCardFeedErrors;
