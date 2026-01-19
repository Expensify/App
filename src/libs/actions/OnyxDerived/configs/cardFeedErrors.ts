import {getCombinedCardFeedsFromAllFeeds, getWorkspaceCardFeedsStatus} from '@libs/CardFeedUtils';
import {filterInactiveCards, getCompanyCardFeedWithDomainID, isCardConnectionBroken} from '@libs/CardUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CardErrors, CardFeedErrorsObject, CardFeedErrorState} from '@src/types/onyx/DerivedValues';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import CONST from '@src/CONST';

const DEFAULT_CARD_FEED_ERROR_STATE: CardFeedErrorState = {
    shouldShowRBR: false,
    hasFailedCardAssignments: false,
    hasWorkspaceErrors: false,
    hasFeedErrors: false,
    isFeedConnectionBroken: false,
};

function getShouldShowRBR(state: Partial<CardFeedErrorState>): boolean {
    if (state.hasFeedErrors) {
        return true;
    }
    if (state.hasWorkspaceErrors) {
        return true;
    }
    if (state.hasFailedCardAssignments) {
        return true;
    }

    return !!state.isFeedConnectionBroken;


}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.CARD_FEED_ERRORS,
    dependencies: [ONYXKEYS.CARD_LIST, ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS, ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER],
    compute: ([globalCardList, allWorkspaceCards, failedCompanyCardAssignmentsPerFeed, cardFeeds]) => {
        const cardFeedErrors: CardFeedErrorsObject = {};
        const shouldShowRbrForWorkspaceAccountID: Record<number, boolean> = {};
        const shouldShowRbrForFeedNameWithDomainID: Record<string, boolean> = {};

        const allFeedsState: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};
        const companyCardFeedsState: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};
        const expensifyCardFeedStates: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};

        const cardsWithBrokenFeedConnection: Record<string, Card> = {};

        const combinedCompanyCardFeeds = getCombinedCardFeedsFromAllFeeds(cardFeeds);
        const workspaceCardFeedsStatus = getWorkspaceCardFeedsStatus(cardFeeds);

        function addErrorsForCard(card: Card) {
            const bankName = card.bank as CardFeedWithNumber;
            const workspaceAccountID = Number(card.fundID);

            const isExpensifyCard = bankName === CONST.EXPENSIFY_CARD.BANK;

            if (Number.isNaN(workspaceAccountID)) {
                return;
            }

            const currentFeedNameWithDomainID = getCompanyCardFeedWithDomainID(bankName, workspaceAccountID);
            const currentFeed = combinedCompanyCardFeeds?.[currentFeedNameWithDomainID];
            const currentFeedErrors = currentFeed?.errors

            const hasFailedCardAssignments = !isEmptyObject(
                failedCompanyCardAssignmentsPerFeed?.[`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${workspaceAccountID}_${currentFeedNameWithDomainID}`],
            );

            let cardErrors: Record<string, CardErrors> = cardFeedErrors[currentFeedNameWithDomainID]?.cardErrors ?? {};
            const hasCardErrors = !isEmptyObject(card.errors) || !isEmptyObject(card.errorFields) || card.pendingAction;

            if (hasCardErrors) {
                cardErrors = {
                    ...cardErrors,
                    [card.cardID]: {
                        errors: card.errors,
                        errorFields: card.errorFields,
                        pendingAction: card.pendingAction,
                    },
                };
            }

            const currentFeedState: Omit<CardFeedErrorState, 'shouldShowRBR'> = {
                isFeedConnectionBroken: isCardConnectionBroken(card),
                hasFeedErrors: currentFeedNameWithDomainID ? !!currentFeedErrors : false,
                hasWorkspaceErrors: !!workspaceCardFeedsStatus?.[workspaceAccountID]?.errors,
                hasFailedCardAssignments,
            };

            const shouldShowRbrForCurrentFeed = getShouldShowRBR(currentFeedState)

            cardFeedErrors[currentFeedNameWithDomainID] = {
                ...currentFeedState,
                shouldShowRBR: shouldShowRbrForCurrentFeed,
                cardErrors,
                feedErrors: currentFeedErrors,
            };

            if (currentFeedState.isFeedConnectionBroken) {
                allFeedsState.isFeedConnectionBroken = true;
                cardsWithBrokenFeedConnection[card.cardID] = card;

                if (isExpensifyCard) {
                    expensifyCardFeedStates.isFeedConnectionBroken = true;
                } else {
                    companyCardFeedsState.isFeedConnectionBroken = true;
                }
            }

            if (currentFeedState.hasFeedErrors) {
                allFeedsState.hasFeedErrors = true;

                if (isExpensifyCard) {
                    expensifyCardFeedStates.hasFeedErrors = true;
                } else {
                    companyCardFeedsState.hasFeedErrors = true;
                }
            }

            if (currentFeedState.hasWorkspaceErrors) {
                allFeedsState.hasWorkspaceErrors = true;

                if (isExpensifyCard) {
                    expensifyCardFeedStates.hasWorkspaceErrors = true;
                } else {
                    companyCardFeedsState.hasWorkspaceErrors = true;
                }
            }

            if (currentFeedState.hasFailedCardAssignments) {
                allFeedsState.hasFailedCardAssignments = true;

                if (isExpensifyCard) {
                    expensifyCardFeedStates.hasFailedCardAssignments = true;
                } else {
                    companyCardFeedsState.hasFailedCardAssignments = true;
                }
            }

            shouldShowRbrForWorkspaceAccountID[workspaceAccountID] = shouldShowRbrForWorkspaceAccountID[workspaceAccountID] || shouldShowRbrForCurrentFeed;

            shouldShowRbrForFeedNameWithDomainID[currentFeedNameWithDomainID] = shouldShowRbrForFeedNameWithDomainID[currentFeedNameWithDomainID] || shouldShowRbrForCurrentFeed;
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

            const {cardList, ...filteredCards} = filterInactiveCards(workspaceCardFeedCards);
            for (const card of Object.values(filteredCards)) {
                addErrorsForCard(card);
            }
        }

        allFeedsState.shouldShowRBR = getShouldShowRBR(allFeedsState);
        companyCardFeedsState.shouldShowRBR = getShouldShowRBR(companyCardFeedsState);
        expensifyCardFeedStates.shouldShowRBR = getShouldShowRBR(expensifyCardFeedStates);

        return {
            // The errors of all card feeds.
            cardFeedErrors,
            cardsWithBrokenFeedConnection,

            // Mappings of whether to show the RBR for each workspace account ID and per feed name with domain ID
            shouldShowRbrForWorkspaceAccountID,
            shouldShowRbrForFeedNameWithDomainID,

            // Whether any of the feeds has one of the below errors
            all: allFeedsState,

            // Whether any of the company cards has one of the below errors
            companyCards: companyCardFeedsState,

            // Whether any of the expensify cards has one of the below errors
            expensifyCard: expensifyCardFeedStates,
        };
    },
});
