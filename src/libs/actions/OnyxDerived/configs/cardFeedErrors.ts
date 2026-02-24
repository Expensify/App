import {buildFeedKeysWithAssignedCards} from '@selectors/Card';
import {getCombinedCardFeedsFromAllFeeds, getWorkspaceCardFeedsStatus} from '@libs/CardFeedUtils';
import {filterInactiveCards, getCardFeedWithDomainID, isCardConnectionBroken, isPersonalCard} from '@libs/CardUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';
import type {CardErrors, CardFeedErrorsObject, CardFeedErrorState} from '@src/types/onyx/DerivedValues';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const DEFAULT_CARD_FEED_ERROR_STATE: CardFeedErrorState = {
    shouldShowRBR: false,
    hasFeedErrors: false,
    hasWorkspaceErrors: false,
    isFeedConnectionBroken: false,
};

function getShouldShowRBR(state: Partial<CardFeedErrorState>): boolean {
    if (state.hasFeedErrors) {
        return true;
    }
    if (state.hasWorkspaceErrors) {
        return true;
    }

    return !!state.isFeedConnectionBroken;
}

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.CARD_FEED_ERRORS,
    dependencies: [ONYXKEYS.CARD_LIST, ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER],
    compute: ([globalCardList, allWorkspaceCards, cardFeeds]) => {
        const feedKeysWithCards = buildFeedKeysWithAssignedCards(allWorkspaceCards);
        const combinedCompanyCardFeeds = getCombinedCardFeedsFromAllFeeds(cardFeeds, undefined, feedKeysWithCards);
        const workspaceCardFeedsStatus = getWorkspaceCardFeedsStatus(cardFeeds);

        const cardFeedErrors: CardFeedErrorsObject = {};
        const shouldShowRbrForWorkspaceAccountID: Record<number, boolean> = {};
        const shouldShowRbrForFeedNameWithDomainID: Record<string, boolean> = {};

        const allFeedsState: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};
        const companyCardFeedsState: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};
        const expensifyCardFeedStates: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};
        const personalCardStates: CardFeedErrorState = {...DEFAULT_CARD_FEED_ERROR_STATE};

        const cardsWithBrokenFeedConnection: Record<string, Card> = {};
        const personalCardsWithBrokenConnection: Record<string, Card> = {};

        function addErrorsForPersonalCard(card: Card) {
            // Skip cards that are not fully loaded yet (e.g. during initial Onyx hydration).
            // `cardID` is typed as required, but partial card data can arrive via Onyx before all
            // fields are populated. Using it as an object key while undefined would silently
            // corrupt the cardErrors map with an "undefined" key.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!card.cardID) {
                return;
            }

            const hasCardErrors = !isEmptyObject(card.errors) || !isEmptyObject(card.errorFields) || card.pendingAction;
            const cardErrors = {
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
            // Track personal cards with broken feed connection
            if (isFeedConnectionBroken) {
                personalCardsWithBrokenConnection[card.cardID] = card;
            }
            const newFeedState: Omit<CardFeedErrorState, 'shouldShowRBR'> = {
                isFeedConnectionBroken,
                hasFeedErrors: !isEmptyObject(cardErrors),
                hasWorkspaceErrors: false,
            };
            const shouldShowRBR = getShouldShowRBR(newFeedState);

            personalCardStates.isFeedConnectionBroken ||= newFeedState.isFeedConnectionBroken;
            personalCardStates.hasFeedErrors ||= newFeedState.hasFeedErrors;
            personalCardStates.shouldShowRBR ||= shouldShowRBR;
        }

        function addErrorsForCard(card: Card) {
            const bankName = card.bank;
            const workspaceAccountID = Number(card.fundID);

            // Skip cards that are not fully loaded yet (e.g. during initial Onyx hydration after login).
            // Although `bank` is typed as required, Onyx can write partial card data during the initial
            // bulk update, leaving `bank` undefined at runtime. Without this guard,
            // getCardFeedWithDomainID() would receive an undefined feedName and produce an invalid key
            // (e.g. "undefined_<domainID>"), corrupting the derived state and potentially triggering a
            // render error caught by the ErrorBoundary, which crashes the app and presents the error page.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!bankName) {
                return;
            }

            const isExpensifyCard = bankName === CONST.EXPENSIFY_CARD.BANK;

            if (Number.isNaN(workspaceAccountID)) {
                return;
            }

            const feedNameWithDomainID = getCardFeedWithDomainID(bankName, workspaceAccountID);
            const previousFeedErrors = cardFeedErrors[feedNameWithDomainID] ?? DEFAULT_CARD_FEED_ERROR_STATE;

            const feed = combinedCompanyCardFeeds?.[feedNameWithDomainID];
            const feedErrors = {
                ...previousFeedErrors.feedErrors,
                ...feed?.errors,
            } as Errors;
            const hasFeedErrors = feedNameWithDomainID ? !isEmptyObject(feedErrors) : false;

            const workspaceErrors = workspaceCardFeedsStatus?.[workspaceAccountID]?.errors;
            const hasWorkspaceErrors = !!workspaceErrors;

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
                hasWorkspaceErrors: hasWorkspaceErrors || previousFeedErrors.hasWorkspaceErrors,
            };

            const shouldShowRBR = getShouldShowRBR(newFeedState) || previousFeedErrors.shouldShowRBR;

            cardFeedErrors[feedNameWithDomainID] = {
                ...newFeedState,
                shouldShowRBR,
                cardErrors,
                feedErrors,
                workspaceErrors,
            };

            // Track cards with broken feed connection
            if (isFeedConnectionBroken) {
                cardsWithBrokenFeedConnection[card.cardID] = card;
            }

            // Update aggregate states - once true, always stays true
            const cardTypeState = isExpensifyCard ? expensifyCardFeedStates : companyCardFeedsState;

            allFeedsState.isFeedConnectionBroken ||= newFeedState.isFeedConnectionBroken;
            allFeedsState.hasFeedErrors ||= newFeedState.hasFeedErrors;
            allFeedsState.hasWorkspaceErrors ||= newFeedState.hasWorkspaceErrors;

            cardTypeState.isFeedConnectionBroken ||= newFeedState.isFeedConnectionBroken;
            cardTypeState.hasFeedErrors ||= newFeedState.hasFeedErrors;
            cardTypeState.hasWorkspaceErrors ||= newFeedState.hasWorkspaceErrors;

            shouldShowRbrForWorkspaceAccountID[workspaceAccountID] ||= shouldShowRBR;
            shouldShowRbrForFeedNameWithDomainID[feedNameWithDomainID] ||= shouldShowRBR;
        }

        for (const card of Object.values(globalCardList ?? {})) {
            const isPersonal = isPersonalCard(card);
            if (isPersonal) {
                addErrorsForPersonalCard(card);
            } else {
                addErrorsForCard(card);
            }
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
            personalCardsWithBrokenConnection,

            // Mappings of whether to show the RBR for each workspace account ID and per feed name with domain ID
            shouldShowRbrForWorkspaceAccountID,
            shouldShowRbrForFeedNameWithDomainID,

            // Whether any of the feeds have one of the below errors
            all: allFeedsState,

            // Whether any of the company cards have one of the below errors
            companyCards: companyCardFeedsState,

            // Whether any of the expensify cards have one of the below errors
            expensifyCard: expensifyCardFeedStates,

            // Whether any of the personal cards have one of the below errors
            personalCard: personalCardStates,
        };
    },
});
