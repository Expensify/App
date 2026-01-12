import type {CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import useCompanyCards from '@hooks/useCompanyCards';
import useOnyx from '@hooks/useOnyx';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {checkIfFeedConnectionIsBroken, filterAllInactiveCards, filterCardsByNonExpensify, getCompanyCardFeed, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type UseCardFeedErrorsProps = {
    policyID: string | undefined;
    feedName?: CompanyCardFeedWithDomainID;
    shouldExcludeExpensifyCards?: boolean;
};

type CardFeedErrors = {
    shouldShowRBR: boolean;
    hasFailedCardAssignments: boolean;
    hasFeedError: boolean;
    isFeedConnectionBroken: boolean;
};

type UseCompanyCardFeedErrorsResult = CardFeedErrors & {
    getCardFeedErrors: (feedName: CompanyCardFeedWithDomainID) => CardFeedErrors;
};

function useCompanyCardFeedErrors({policyID, feedName, shouldExcludeExpensifyCards = false}: UseCardFeedErrorsProps): UseCompanyCardFeedErrorsResult {
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    const {companyCardFeeds} = useCompanyCards({policyID, feedName});
    const [allCards] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const filteredCards = filterAllInactiveCards(shouldExcludeExpensifyCards ? filterCardsByNonExpensify(allCards) : allCards);

    const [failedCompanyCardAssignmentsPerFeed] = useOnyx(ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS, {canBeMissing: true});

    const getCardFeedErrors = (feedNameFn: CompanyCardFeedWithDomainID | undefined): CardFeedErrors => {
        const bankName = getCompanyCardFeed(feedNameFn);
        const selectedFeed = bankName && companyCardFeeds?.[bankName];
        const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, selectedFeed);

        const hasFailedCardAssignments = !isEmptyObject(
            failedCompanyCardAssignmentsPerFeed?.[`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}_${feedNameFn ?? ''}`],
        );
        const hasFeedError = feedNameFn ? !!selectedFeed?.errors : false;

        const feedToExclude = shouldExcludeExpensifyCards ? CONST.EXPENSIFY_CARD.BANK : undefined;
        const isFeedConnectionBroken = checkIfFeedConnectionIsBroken(filteredCards, feedToExclude);

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
