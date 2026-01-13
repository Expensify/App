import {getCombinedCardFeedsFromAllFeeds} from '@libs/CardFeedUtils';
import {getCompanyCardFeedWithDomainID, isCardConnectionBroken} from '@libs/CardUtils';
import {mapToObject} from '@libs/ObjectUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeed} from '@src/types/onyx';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {AllCardFeedErrorsMap, CardErrors, CardFeedErrorsObject, FeedErrors} from '@src/types/onyx/DerivedValues';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.CARD_FEED_ERRORS,
    dependencies: [ONYXKEYS.CARD_LIST, ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS, ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER],
    compute: ([globalCardList, allWorkspaceCards, failedCompanyCardAssignmentsPerFeed, cardFeeds]) => {
        const cardFeedErrors: AllCardFeedErrorsMap = new Map();
        const rbrWorkspaceAccountIDMapping: Record<number, boolean> = {};
        const rbrFeedNameWithDomainIDMapping: Record<string, boolean> = {};
        let isSomeFeedConnectionBroken = false;
        let hasSomeFeedErrors = false;
        let hasSomeFailedCardAssignment = false;

        function addErrorsForCard(card: Card) {
            const bankName = card.bank as CompanyCardFeedWithNumber;
            const workspaceAccountID = Number(card.fundID);
            const feedNameWithDomainID = getCompanyCardFeedWithDomainID(bankName, workspaceAccountID);

            const combinedCompanyCardFeeds = getCombinedCardFeedsFromAllFeeds(cardFeeds);
            const selectedFeed = combinedCompanyCardFeeds?.[feedNameWithDomainID];

            const hasFailedCardAssignments = !isEmptyObject(
                failedCompanyCardAssignmentsPerFeed?.[`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${workspaceAccountID}_${feedNameWithDomainID}`],
            );

            const allFeedsErrors = cardFeedErrors.get(workspaceAccountID) ?? new Map<CardFeed, FeedErrors>();
            const feedErrors = allFeedsErrors.get(bankName);
            const cardErrors = feedErrors?.cardErrors ?? ({} as Record<string, CardErrors>);

            const hasFeedError = feedNameWithDomainID ? !!selectedFeed?.errors : false;
            const isFeedConnectionBroken = isCardConnectionBroken(card);
            const shouldShowRBR = hasFailedCardAssignments || hasFeedError || isFeedConnectionBroken;

            if (isFeedConnectionBroken) {
                isSomeFeedConnectionBroken = true;
            }

            if (hasFeedError) {
                hasSomeFeedErrors = true;
            }

            if (hasFailedCardAssignments) {
                hasSomeFailedCardAssignment = true;
            }

            rbrWorkspaceAccountIDMapping[workspaceAccountID] = rbrWorkspaceAccountIDMapping[workspaceAccountID] || shouldShowRBR;

            rbrFeedNameWithDomainIDMapping[feedNameWithDomainID] = rbrFeedNameWithDomainIDMapping[feedNameWithDomainID] || shouldShowRBR;

            allFeedsErrors.set(bankName, {
                shouldShowRBR,
                hasFailedCardAssignments,
                hasFeedError,
                isFeedConnectionBroken,
                cardErrors,
            });

            cardFeedErrors.set(workspaceAccountID, allFeedsErrors);
        }

        for (const card of Object.values(globalCardList ?? {})) {
            addErrorsForCard(card);
        }

        for (const [key, workspaceCardFeedCards] of Object.entries(allWorkspaceCards ?? {})) {
            const keyParts = key.split(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
            const workspaceCardParamParts = keyParts.at(1)?.split('_');

            if (!workspaceCardParamParts) {
                continue;
            }

            const {cardList, ...cards} = workspaceCardFeedCards ?? {};

            for (const card of Object.values(cards ?? {})) {
                addErrorsForCard(card);
            }
        }

        const shouldShowRBR = hasSomeFeedErrors || hasSomeFailedCardAssignment || isSomeFeedConnectionBroken;

        return {
            // The errors of all card feeds.
            cardFeedErrors: mapToObject(cardFeedErrors) as CardFeedErrorsObject,

            // Mappings of whether to show the RBR for each workspace account ID and per feed name with domain ID
            rbrWorkspaceAccountIDMapping,
            rbrFeedNameWithDomainIDMapping,

            // Whether any of the feeds has one of the below errors
            shouldShowRBR,
            isFeedConnectionBroken: isSomeFeedConnectionBroken,
            hasFeedErrors: hasSomeFeedErrors,
            hasFailedCardAssignment: hasSomeFailedCardAssignment,
        };
    },
});
