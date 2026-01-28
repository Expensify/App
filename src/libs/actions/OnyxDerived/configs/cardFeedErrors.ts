import {getCombinedCardFeedsFromAllFeeds} from '@libs/CardFeedUtils';
import {filterInactiveCards, getCompanyCardFeedWithDomainID, isCardConnectionBroken} from '@libs/CardUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type {CompanyCardFeed, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CardErrors, CardFeedErrorsObject, CardFeedErrorState} from '@src/types/onyx/DerivedValues';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const DEFAULT_CARD_FEED_ERROR_STATE: CardFeedErrorState = {
    shouldShowRBR: false,
    hasFeedErrors: false,
    isFeedConnectionBroken: false,
};

function getShouldShowRBR(state: Partial<CardFeedErrorState>): boolean {
    if (state.hasFeedErrors) {
        return true;
    }

    return !!state.isFeedConnectionBroken;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.CARD_FEED_ERRORS,
    dependencies: [ONYXKEYS.CARD_LIST, ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER],
    compute: ([globalCardList, allWorkspaceCards, cardFeeds]) => {
        const combinedCompanyCardFeeds = getCombinedCardFeedsFromAllFeeds(cardFeeds);
        const cardFeedErrors: CardFeedErrorsObject = {};
        const shouldShowRbrForWorkspaceAccountID: Record<number, boolean> = {};
        const shouldShowRbrForFeedNameWithDomainID: Record<string, boolean> = {};

        const allFeedsState: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};
        const companyCardFeedsState: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};
        const expensifyCardFeedStates: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};

        const cardsWithBrokenFeedConnection: Record<string, Card> = {};

        function addErrorsForCard(card: Card) {
            const bankName = card.bank as CompanyCardFeedWithNumber | typeof CONST.EXPENSIFY_CARD.BANK;
            const workspaceAccountID = Number(card.fundID);

            const isExpensifyCard = bankName === CONST.EXPENSIFY_CARD.BANK;

            if (Number.isNaN(workspaceAccountID)) {
                return;
            }

            const feedNameWithDomainID = getCompanyCardFeedWithDomainID(bankName as CompanyCardFeed, workspaceAccountID);
            const previousFeedErrors = cardFeedErrors[feedNameWithDomainID] ?? DEFAULT_CARD_FEED_ERROR_STATE;

            const feed = combinedCompanyCardFeeds?.[feedNameWithDomainID];
            const feedErrors = {
                ...previousFeedErrors.feedErrors,
                ...feed?.errors,
            } as Errors;
            const hasFeedErrors = feedNameWithDomainID ? !isEmptyObject(feedErrors) : false;

            const hasCardErrors = !isEmptyObject(card.errors) || !isEmptyObject(card.errorFields) || card.pendingAction;
            const cardErrors = {
                ...previousFeedErrors.cardErrors,
                ...(cardFeedErrors[feedNameWithDomainID]?.cardErrors ?? {}),
                ...(hasCardErrors
                    ? {
                          [card.cardID]: {
                              errors: card.errors,
                              errorFields: card.errorFields,
                              pendingAction: card.pendingAction,
                          },
                      }
                    : {}),
            } as Record<string, CardErrors>;

            const isFeedConnectionBroken = isCardConnectionBroken(card);

            const newFeedState: Omit<CardFeedErrorState, 'shouldShowRBR'> = {
                isFeedConnectionBroken: isFeedConnectionBroken || previousFeedErrors.isFeedConnectionBroken,
                hasFeedErrors: hasFeedErrors || previousFeedErrors.hasFeedErrors,
            };

            const shouldShowRBR = getShouldShowRBR(newFeedState) || previousFeedErrors.shouldShowRBR;

            cardFeedErrors[feedNameWithDomainID] = {
                ...newFeedState,
                shouldShowRBR,
                cardErrors,
                feedErrors,
            };

            // Track cards with broken feed connection
            if (isFeedConnectionBroken) {
                cardsWithBrokenFeedConnection[card.cardID] = card;
            }

            // Update aggregate states - once true, always stays true
            const cardTypeState = isExpensifyCard ? expensifyCardFeedStates : companyCardFeedsState;

            allFeedsState.isFeedConnectionBroken ||= newFeedState.isFeedConnectionBroken;
            allFeedsState.hasFeedErrors ||= newFeedState.hasFeedErrors;

            cardTypeState.isFeedConnectionBroken ||= newFeedState.isFeedConnectionBroken;
            cardTypeState.hasFeedErrors ||= newFeedState.hasFeedErrors;

            shouldShowRbrForWorkspaceAccountID[workspaceAccountID] ||= shouldShowRBR;
            shouldShowRbrForFeedNameWithDomainID[feedNameWithDomainID] ||= shouldShowRBR;
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
