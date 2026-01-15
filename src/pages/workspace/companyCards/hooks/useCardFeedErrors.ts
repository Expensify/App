import type {CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useCompanyCards from '@hooks/useCompanyCards';
import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {checkIfFeedConnectionIsBroken, flatAllCardsList, getCompanyCardFeed, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';

type UseCompanyCardFeedErrorsProps = {
    policyID: string | undefined;
    feedName?: CompanyCardFeedWithDomainID;
};

type CompanyCardFeedErrors = {
    shouldShowRBR: boolean;
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

    const getCardFeedErrors = (feedNameFn: CompanyCardFeedWithDomainID | undefined): CompanyCardFeedErrors => {
        const bankName = getCompanyCardFeed(feedNameFn);
        const selectedFeed = bankName && companyCardFeeds?.[bankName];
        const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed);

        const hasFeedError = feedNameFn ? !!selectedFeed?.errors : false;
        const isFeedConnectionBroken = checkIfFeedConnectionIsBroken(flatAllCardsList(allFeedsCards, domainOrWorkspaceAccountID), feedNameFn);

        const shouldShowRBR = hasFeedError || isFeedConnectionBroken;

        return {
            shouldShowRBR,
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
