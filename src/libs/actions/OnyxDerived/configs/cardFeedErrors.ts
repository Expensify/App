import {getCombinedCardFeedsFromAllFeeds} from '@libs/CardFeedUtils';
import {getCompanyCardFeedWithDomainID, isCardConnectionBroken} from '@libs/CardUtils';
import {mapToObject} from '@libs/ObjectUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeed} from '@src/types/onyx';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {AllCardFeedErrorsMap, CardErrors, CardFeedErrorsObject, FeedErrors} from '@src/types/onyx/DerivedValues';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// function getPolicyWorkspaceAccountIDMapping(policyCollection: OnyxCollection<Policy>): Record<string, number> {
//     return Object.entries(policyCollection ?? {}).reduce<Record<string, number>>((acc, [key, value]) => {
//         acc[key] = value?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
//         return acc;
//     }, {});
// }

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.CARD_FEED_ERRORS,
    dependencies: [ONYXKEYS.CARD_LIST, ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS, ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER],
    compute: ([globalCardList, allWorkspaceCards, failedCompanyCardAssignmentsPerFeed, cardFeeds]) => {
        const cardFeedErrors: AllCardFeedErrorsMap = new Map();
        let isSomeFeedConnectionBroken = false;
        let hasSomeFeedErrors = false;
        let hasSomeFailedCardAssignments = false;
        const shouldShowRBRPerWorkspaceAccountID: Record<number, boolean> = {};

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

            const hasFeedError = feedName ? !!selectedFeed?.errors : false;
            const isFeedConnectionBroken = isCardConnectionBroken(card);
            const shouldShowRBR = hasFailedCardAssignments || hasFeedError || isFeedConnectionBroken;

            if (isFeedConnectionBroken) {
                isSomeFeedConnectionBroken = true;
            }

            if (hasSomeFeedErrors) {
                hasSomeFeedErrors = true;
            }

            if (hasFailedCardAssignments) {
                hasSomeFailedCardAssignments = true;
            }

            shouldShowRBRPerWorkspaceAccountID[workspaceAccountID] = shouldShowRBR;

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

        const shouldShowRBRForAllFeeds = hasSomeFeedErrors || hasSomeFailedCardAssignments || isSomeFeedConnectionBroken;

        return {
            cardFeedErrors: mapToObject(cardFeedErrors) as CardFeedErrorsObject,
            shouldShowRBRForAllFeeds,
            shouldShowRBRPerWorkspaceAccountID,
            isSomeFeedConnectionBroken,
            hasSomeFeedErrors,
            hasSomeFailedCardAssignments,
        };
    },
});
