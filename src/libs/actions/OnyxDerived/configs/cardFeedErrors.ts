import {getCombinedCardFeedsFromAllFeeds} from '@libs/CardFeedUtils';
import {getCompanyCardFeedWithDomainID, isCardConnectionBroken} from '@libs/CardUtils';
import {mapToObject} from '@libs/ObjectUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeed, CompanyCardFeed} from '@src/types/onyx';
import type {AllCardFeedErrors, AllCardFeedErrorsMap, CardErrors, CardFeedErrors} from '@src/types/onyx/DerivedValues';
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
    compute: ([globalCardList, allWorkspaceCards, failedCompanyCardAssignmentsPerFeed, companyCardFeedsPerWorkspaceAccountID]) => {
        // const [policyWorkspaceAccountIDMapping] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true, selector: getPolicyWorkspaceAccountIDMapping});

        // const companyCardFeeds = new Map<{workspaceAccountID: number, feedName: CardFeed}, CardFeedData>();

        // for (const [key, value] of Object.entries(allWorkspaceCards ?? {})) {
        //     const keyParts = key.split(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST)
        //     const workspaceCardParamParts = keyParts.at(1)?.split('_');

        //     if (!workspaceCardParamParts) {
        //         continue;
        //     }

        //     const [workspaceAccountID, feedName] = workspaceCardParamParts as [string, CardFeed];

        //     companyCardFeeds.set({workspaceAccountID: Number(workspaceAccountID), feedName}, value);
        // }

        const cardFeedErrors: AllCardFeedErrorsMap = new Map();

        function addErrorsForCard(card: Card) {
            const bankName = card.bank as CompanyCardFeed;
            const workspaceAccountID = Number(card.fundID);
            const feedName = getCompanyCardFeedWithDomainID(bankName, workspaceAccountID);

            // const cardFeedCards = allWorkspaceCards?.[`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bankName}`];

            // const companyCardFeeds = companyCardFeedsPerWorkspaceAccountID?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`];

            const combinedCompanyCardFeeds = getCombinedCardFeedsFromAllFeeds(companyCardFeedsPerWorkspaceAccountID);
            const selectedFeed = combinedCompanyCardFeeds?.[feedName];

            const hasFailedCardAssignments = !isEmptyObject(
                failedCompanyCardAssignmentsPerFeed?.[`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${workspaceAccountID}_${feedName}`],
            );

            const allFeedsErrors = cardFeedErrors.get(workspaceAccountID) ?? new Map<CardFeed, CardFeedErrors>();
            const feedErrors = allFeedsErrors.get(bankName);
            const cardErrors = feedErrors?.cardErrors ?? ({} as Record<string, CardErrors>);

            const hasFeedError = feedName ? !!selectedFeed?.errors : false;
            const isFeedConnectionBroken = isCardConnectionBroken(card);
            const shouldShowRBR = hasFailedCardAssignments || hasFeedError || isFeedConnectionBroken;

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

            // const [workspaceAccountID, feedName] = workspaceCardParamParts as [number, CardFeed];

            const {cardList, ...cards} = workspaceCardFeedCards ?? {};

            for (const card of Object.values(cards ?? {})) {
                addErrorsForCard(card);
            }
        }

        return mapToObject(cardFeedErrors) as AllCardFeedErrors;
    },
});
