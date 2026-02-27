import type {OnyxCollection} from 'react-native-onyx';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import CONST from '@src/CONST';
import cardFeedErrorsConfig from '@src/libs/actions/OnyxDerived/configs/cardFeedErrors';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeeds, CardList, WorkspaceCardsList} from '@src/types/onyx';

const DERIVED_VALUE_CONTEXT: DerivedValueContext<typeof cardFeedErrorsConfig.key, typeof cardFeedErrorsConfig.dependencies> = {
    currentValue: undefined,
    sourceValues: undefined,
};

const WORKSPACE_ACCOUNT_ID = 99999999;

// Direct bank connection feed (OAuth-based, e.g. Chase)
const DIRECT_BANK_FEED = {
    workspaceAccountID: WORKSPACE_ACCOUNT_ID,
    feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    feedNameWithDomainID: getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, WORKSPACE_ACCOUNT_ID),
} as const;

// Plaid connection feed (Plaid feed names are dynamically generated at runtime and not part of the static CardFeedWithNumber union)
const PLAID_FEED_NAME = 'plaid.chase_bank' as unknown as Card['bank'];
const PLAID_FEED = {
    workspaceAccountID: WORKSPACE_ACCOUNT_ID,
    feedName: PLAID_FEED_NAME,
    feedNameWithDomainID: getCardFeedWithDomainID(PLAID_FEED_NAME, WORKSPACE_ACCOUNT_ID),
};

function createCard(overrides: Partial<Card> = {}): Card {
    return {
        cardID: 1,
        accountID: 1,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        cardName: 'Test Card',
        domainName: 'test.exfy',
        fraud: 'none',
        lastFourPAN: '1234',
        lastScrape: '',
        lastUpdated: '',
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        ...overrides,
    };
}

function createWorkspaceCardsList(cards: Record<string, Card>): WorkspaceCardsList {
    return cards as WorkspaceCardsList;
}

describe('Company Cards RBR - broken bank/Plaid connection', () => {
    describe('direct bank connection (OAuth) broken', () => {
        it('should show RBR when a direct bank connection card has a broken lastScrapeResult', () => {
            const card = createCard({
                cardID: 1,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
                lastScrapeResult: 403,
            });

            const globalCardList: CardList = {card1: card};
            const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);
            expect(result.all.isFeedConnectionBroken).toBe(true);
            expect(result.all.shouldShowRBR).toBe(true);
            expect(result.cardsWithBrokenFeedConnection[1]).toEqual(card);
        });

        it('should show RBR from workspace cards list when direct bank connection is broken', () => {
            const card = createCard({
                cardID: 2,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
                lastScrapeResult: 401,
            });

            const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DIRECT_BANK_FEED.workspaceAccountID}_${DIRECT_BANK_FEED.feedNameWithDomainID}`]: createWorkspaceCardsList({
                    card2: card,
                }),
            };

            const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);
            expect(result.all.isFeedConnectionBroken).toBe(true);
            expect(result.cardsWithBrokenFeedConnection[2]).toEqual(card);
        });

        it('should NOT show RBR when direct bank connection card has a successful lastScrapeResult', () => {
            const card = createCard({
                cardID: 1,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
                lastScrapeResult: 200,
            });

            const globalCardList: CardList = {card1: card};
            const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(false);
            expect(result.all.isFeedConnectionBroken).toBe(false);
            expect(result.all.shouldShowRBR).toBe(false);
        });
    });

    describe('Plaid connection broken', () => {
        it('should show RBR when a Plaid-connected card has a broken lastScrapeResult', () => {
            const card = createCard({
                cardID: 3,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
                lastScrapeResult: 403,
            });

            const globalCardList: CardList = {card3: card};
            const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);
            expect(result.all.isFeedConnectionBroken).toBe(true);
            expect(result.all.shouldShowRBR).toBe(true);
            expect(result.cardsWithBrokenFeedConnection[3]).toEqual(card);
        });

        it('should show RBR from workspace cards list when Plaid connection is broken', () => {
            const card = createCard({
                cardID: 4,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
                lastScrapeResult: 401,
            });

            const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${PLAID_FEED.workspaceAccountID}_${PLAID_FEED.feedNameWithDomainID}`]: createWorkspaceCardsList({card4: card}),
            };

            const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);
            expect(result.all.isFeedConnectionBroken).toBe(true);
            expect(result.cardsWithBrokenFeedConnection[4]).toEqual(card);
        });

        it('should NOT show RBR when Plaid-connected card has a successful lastScrapeResult', () => {
            const card = createCard({
                cardID: 3,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
                lastScrapeResult: 200,
            });

            const globalCardList: CardList = {card3: card};
            const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(false);
            expect(result.all.isFeedConnectionBroken).toBe(false);
            expect(result.all.shouldShowRBR).toBe(false);
        });
    });

    describe('feed-level errors on direct/Plaid connections', () => {
        it('should show RBR when a direct bank feed has errors', () => {
            const card = createCard({
                cardID: 1,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
            });

            const globalCardList: CardList = {card1: card};

            const cardFeeds: OnyxCollection<CardFeeds> = {
                [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DIRECT_BANK_FEED.workspaceAccountID}`]: {
                    settings: {
                        companyCards: {
                            [DIRECT_BANK_FEED.feedName]: {
                                pending: false,
                                errors: {connectionError: 'Bank connection lost'},
                            },
                        },
                        oAuthAccountDetails: {
                            [DIRECT_BANK_FEED.feedName]: {accountList: ['CREDIT CARD...1234'], credentials: 'xxxxx', expiration: 1730998958},
                        },
                    },
                },
            };

            const result = cardFeedErrorsConfig.compute([globalCardList, {}, cardFeeds], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);
            expect(result.all.hasFeedErrors).toBe(true);
            expect(result.all.shouldShowRBR).toBe(true);
        });

        it('should show RBR when a Plaid feed has errors', () => {
            const card = createCard({
                cardID: 3,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
            });

            const globalCardList: CardList = {card3: card};

            const cardFeeds: OnyxCollection<CardFeeds> = {
                [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${PLAID_FEED.workspaceAccountID}`]: {
                    settings: {
                        companyCards: {
                            [PLAID_FEED.feedName]: {
                                pending: false,
                                errors: {plaidError: 'Plaid authentication expired'},
                            },
                        },
                        oAuthAccountDetails: {
                            [PLAID_FEED.feedName]: {accountList: ['CHECKING...5678'], credentials: 'xxxxx', expiration: 1730998958},
                        },
                    },
                },
            };

            const result = cardFeedErrorsConfig.compute([globalCardList, {}, cardFeeds], DERIVED_VALUE_CONTEXT);

            expect(result.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);
            expect(result.all.hasFeedErrors).toBe(true);
            expect(result.all.shouldShowRBR).toBe(true);
        });
    });

    describe('RBR clears after connection is fixed', () => {
        it('should not show RBR after direct bank connection is re-established', () => {
            // First: connection is broken
            const brokenCard = createCard({
                cardID: 1,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
                lastScrapeResult: 403,
            });

            const brokenResult = cardFeedErrorsConfig.compute([{card1: brokenCard}, {}, {}], DERIVED_VALUE_CONTEXT);
            expect(brokenResult.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);

            // Then: connection is fixed (lastScrapeResult returns to 200)
            const fixedCard = createCard({
                cardID: 1,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
                lastScrapeResult: 200,
            });

            const fixedResult = cardFeedErrorsConfig.compute([{card1: fixedCard}, {}, {}], DERIVED_VALUE_CONTEXT);
            expect(fixedResult.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(false);
            expect(fixedResult.all.shouldShowRBR).toBe(false);
            expect(fixedResult.cardsWithBrokenFeedConnection).toEqual({});
        });

        it('should not show RBR after Plaid connection is re-established', () => {
            // First: Plaid connection is broken
            const brokenCard = createCard({
                cardID: 3,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
                lastScrapeResult: 401,
            });

            const brokenResult = cardFeedErrorsConfig.compute([{card3: brokenCard}, {}, {}], DERIVED_VALUE_CONTEXT);
            expect(brokenResult.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(true);

            // Then: Plaid re-authenticated successfully
            const fixedCard = createCard({
                cardID: 3,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
                lastScrapeResult: 200,
            });

            const fixedResult = cardFeedErrorsConfig.compute([{card3: fixedCard}, {}, {}], DERIVED_VALUE_CONTEXT);
            expect(fixedResult.shouldShowRbrForWorkspaceAccountID[WORKSPACE_ACCOUNT_ID]).toBe(false);
            expect(fixedResult.all.shouldShowRBR).toBe(false);
            expect(fixedResult.cardsWithBrokenFeedConnection).toEqual({});
        });
    });

    describe('inactive cards should not trigger RBR', () => {
        it('should not show RBR for closed cards with broken connection', () => {
            const closedCard = createCard({
                cardID: 1,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
                state: CONST.EXPENSIFY_CARD.STATE.CLOSED,
                lastScrapeResult: 403,
            });

            const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${DIRECT_BANK_FEED.workspaceAccountID}_${DIRECT_BANK_FEED.feedNameWithDomainID}`]: createWorkspaceCardsList({
                    card1: closedCard,
                }),
            };

            const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}], DERIVED_VALUE_CONTEXT);

            expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty('1');
        });

        it('should not show RBR for deactivated cards with broken Plaid connection', () => {
            const deactivatedCard = createCard({
                cardID: 3,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
                state: CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED,
                lastScrapeResult: 403,
            });

            const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${PLAID_FEED.workspaceAccountID}_${PLAID_FEED.feedNameWithDomainID}`]: createWorkspaceCardsList({
                    card3: deactivatedCard,
                }),
            };

            const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}], DERIVED_VALUE_CONTEXT);

            expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty('3');
        });
    });

    describe('ignored scrape statuses should not trigger RBR', () => {
        it.each(CONST.COMPANY_CARDS.BROKEN_CONNECTION_IGNORED_STATUSES)('should NOT show RBR when direct bank card lastScrapeResult is %s', (status) => {
            const card = createCard({
                cardID: 1,
                bank: DIRECT_BANK_FEED.feedName,
                fundID: String(DIRECT_BANK_FEED.workspaceAccountID),
                lastScrapeResult: status,
            });

            const result = cardFeedErrorsConfig.compute([{card1: card}, {}, {}], DERIVED_VALUE_CONTEXT);

            expect(result.all.isFeedConnectionBroken).toBe(false);
            expect(result.cardsWithBrokenFeedConnection).toEqual({});
        });

        it.each(CONST.COMPANY_CARDS.BROKEN_CONNECTION_IGNORED_STATUSES)('should NOT show RBR when Plaid card lastScrapeResult is %s', (status) => {
            const card = createCard({
                cardID: 3,
                bank: PLAID_FEED.feedName,
                fundID: String(PLAID_FEED.workspaceAccountID),
                lastScrapeResult: status,
            });

            const result = cardFeedErrorsConfig.compute([{card3: card}, {}, {}], DERIVED_VALUE_CONTEXT);

            expect(result.all.isFeedConnectionBroken).toBe(false);
            expect(result.cardsWithBrokenFeedConnection).toEqual({});
        });
    });
});
