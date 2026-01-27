import type {OnyxCollection} from 'react-native-onyx';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import CONST from '@src/CONST';
import cardFeedErrorsConfig from '@src/libs/actions/OnyxDerived/configs/cardFeedErrors';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeeds, CardList, FailedCardAssignments, WorkspaceCardsList} from '@src/types/onyx';
import type {CardFeedWithDomainID, CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

const DERIVED_VALUE_CONTEXT: DerivedValueContext<typeof cardFeedErrorsConfig.key, typeof cardFeedErrorsConfig.dependencies> = {
    currentValue: undefined,
    sourceValues: undefined,
    areAllConnectionsSet: false,
};

const CARD_FEEDS = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: {
        workspaceAccountID: 44444444,
        feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
        feedNameWithDomainID: getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, 44444444),
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {
        workspaceAccountID: 55555555,
        feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
        feedNameWithDomainID: getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, 55555555),
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT]: {
        workspaceAccountID: 66666666,
        feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT,
        feedNameWithDomainID: getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT, 66666666),
    },
} as const satisfies Partial<
    Record<
        CardFeedWithNumber,
        {
            workspaceAccountID: number;
            feedName: CardFeedWithNumber;
            feedNameWithDomainID: CardFeedWithDomainID;
        }
    >
>;

const CARD_IDS = {
    card1: 1,
    card2: 2,
    card3: 3,
    card4: 4,
};

// Helper to create a card with specified properties
function createCard(overrides: Partial<Card> = {}): Card {
    return {
        cardID: CARD_IDS.card1,
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

// Helper to create workspace cards list
function createWorkspaceCardsList(cards: Record<string, Card>, cardList?: Record<string, string>): WorkspaceCardsList {
    return {
        ...cards,
        ...(cardList ? {cardList} : {}),
    } as WorkspaceCardsList;
}

describe('CardFeedErrors Derived Value', () => {
    describe('compute function', () => {
        it('should return empty errors when no cards exist', () => {
            const result = cardFeedErrorsConfig.compute([{}, {}, {}, {}], DERIVED_VALUE_CONTEXT);

            expect(result.cardFeedErrors).toEqual({});
            expect(result.cardsWithBrokenFeedConnection).toEqual({});
            expect(result.shouldShowRbrForWorkspaceAccountID).toEqual({});
            expect(result.shouldShowRbrForFeedNameWithDomainID).toEqual({});
            expect(result.all.shouldShowRBR).toBe(false);
            expect(result.all.isFeedConnectionBroken).toBe(false);
            expect(result.all.hasFeedErrors).toBe(false);
            // expect(result.all.hasWorkspaceErrors).toBe(false);
            expect(result.all.hasFailedCardAssignments).toBe(false);
        });

        it('should return empty errors when all inputs are undefined', () => {
            const result = cardFeedErrorsConfig.compute([undefined, undefined, undefined, undefined], DERIVED_VALUE_CONTEXT);

            expect(result.cardFeedErrors).toEqual({});
            expect(result.all.shouldShowRBR).toBe(false);
        });

        describe('broken feed connection detection', () => {
            it('should detect broken connection when lastScrapeResult is not in ignored statuses', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];
                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 403, // Not in BROKEN_CONNECTION_IGNORED_STATUSES
                });

                const globalCardList: CardList = {card1: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.isFeedConnectionBroken).toBe(true);
                expect(result.all.shouldShowRBR).toBe(true);
                expect(result.cardsWithBrokenFeedConnection[CARD_IDS.card1]).toEqual(card);
            });

            it('should NOT detect broken connection when lastScrapeResult is 200 (success)', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];
                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 200,
                });

                const globalCardList: CardList = {card1: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.isFeedConnectionBroken).toBe(false);
                expect(result.cardsWithBrokenFeedConnection).toEqual({});
            });

            it.each([200, 531, 530, 500, 666])('should NOT detect broken connection when lastScrapeResult is %s (ignored status)', (status) => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];
                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: status,
                });

                const globalCardList: CardList = {card1: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.isFeedConnectionBroken).toBe(false);
            });

            it('should NOT detect broken connection when lastScrapeResult is undefined', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];
                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: undefined,
                });

                const globalCardList: CardList = {card1: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.isFeedConnectionBroken).toBe(false);
            });
        });

        describe('processing cards from workspace cards collection', () => {
            it('should process cards from allWorkspaceCards', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];
                const card = createCard({
                    cardID: CARD_IDS.card2,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 401, // Broken connection
                });

                const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                    [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${cardFeed.workspaceAccountID}_${cardFeed.feedNameWithDomainID}`]: createWorkspaceCardsList({card2: card}),
                };

                const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.isFeedConnectionBroken).toBe(true);
                expect(result.cardsWithBrokenFeedConnection[CARD_IDS.card2]).toEqual(card);
            });

            it('should filter out inactive cards (closed, deactivated, suspended)', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const closedCard = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    state: CONST.EXPENSIFY_CARD.STATE.CLOSED,
                    lastScrapeResult: 403,
                });

                const deactivatedCard = createCard({
                    cardID: CARD_IDS.card2,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    state: CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED,
                    lastScrapeResult: 403,
                });

                const suspendedCard = createCard({
                    cardID: CARD_IDS.card3,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    state: CONST.EXPENSIFY_CARD.STATE.STATE_SUSPENDED,
                    lastScrapeResult: 403,
                });

                const activeCard = createCard({
                    cardID: CARD_IDS.card4,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    state: CONST.EXPENSIFY_CARD.STATE.OPEN,
                    lastScrapeResult: 403,
                });

                const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                    [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${cardFeed.workspaceAccountID}_${cardFeed.feedNameWithDomainID}`]: createWorkspaceCardsList({
                        card1: closedCard,
                        card2: deactivatedCard,
                        card3: suspendedCard,
                        card4: activeCard,
                    }),
                };

                const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}, {}], DERIVED_VALUE_CONTEXT);

                // Only the active card should be processed and detected as broken
                expect(result.cardsWithBrokenFeedConnection).toHaveProperty(String(CARD_IDS.card4));
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty(String(CARD_IDS.card1));
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty(String(CARD_IDS.card2));
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty(String(CARD_IDS.card3));
            });
        });

        describe('failed card assignments detection', () => {
            it('should detect failed card assignments', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card3,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                });

                const globalCardList: CardList = {[CARD_IDS.card3]: card};

                const failedAssignments: OnyxCollection<FailedCardAssignments> = {
                    [`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${cardFeed.workspaceAccountID}_${cardFeed.feedNameWithDomainID}`]: {
                        [String(CARD_IDS.card3)]: {
                            errors: {error: 'Failed to assign card'},
                            errorFields: undefined,
                            pendingAction: undefined,
                            domainOrWorkspaceAccountID: cardFeed.workspaceAccountID,
                            bankName: cardFeed.feedName,
                            cardName: card.cardName ?? '',
                            encryptedCardNumber: card.encryptedCardNumber ?? '',
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, failedAssignments, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.hasFailedCardAssignments).toBe(true);
                expect(result.all.shouldShowRBR).toBe(true);
                expect(result.cardFeedErrors[cardFeed.feedNameWithDomainID]?.hasFailedCardAssignments).toBe(true);
            });

            it('should NOT detect failed card assignments when empty', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card4,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                });

                const globalCardList: CardList = {[CARD_IDS.card4]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.hasFailedCardAssignments).toBe(false);
            });
        });

        describe('feed errors detection', () => {
            it('should detect feed errors from cardFeeds', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const cardFeeds: OnyxCollection<CardFeeds> = {
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${cardFeed.workspaceAccountID}`]: {
                        settings: {
                            companyCards: {
                                [cardFeed.feedName]: {
                                    pending: false,
                                    errors: {
                                        feedError: 'Connection failed',
                                    },
                                },
                            },
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, cardFeeds], DERIVED_VALUE_CONTEXT);

                expect(result.all.hasFeedErrors).toBe(true);
                expect(result.all.shouldShowRBR).toBe(true);
                expect(result.cardFeedErrors[cardFeed.feedNameWithDomainID]?.hasFeedErrors).toBe(true);
                expect(result.cardFeedErrors[cardFeed.feedNameWithDomainID]?.feedErrors).toEqual({feedError: 'Connection failed'});
            });
        });

        // describe('workspace errors detection', () => {
        //     it('should detect workspace errors', () => {
        //         const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

        //         const card = createCard({
        //             cardID: CARD_IDS.card2,
        //             bank: cardFeed.feedName,
        //             fundID: String(cardFeed.workspaceAccountID),
        //         });

        //         const globalCardList: CardList = {[CARD_IDS.card1]: card};

        //         const cardFeeds: OnyxCollection<CardFeeds> = {
        //             [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${cardFeed.workspaceAccountID}`]: {
        //                 errors: {
        //                     workspaceError: 'Workspace connection issue',
        //                 },
        //                 settings: {
        //                     companyCards: {
        //                         [cardFeed.feedName]: {
        //                             pending: false,
        //                         },
        //                     },
        //                 },
        //             },
        //         };

        //         const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, cardFeeds], DERIVED_VALUE_CONTEXT);

        //         expect(result.all.hasWorkspaceErrors).toBe(true);
        //         expect(result.cardFeedErrors[cardFeed.feedNameWithDomainID]?.hasWorkspaceErrors).toBe(true);
        //     });
        // });

        describe('card-level errors detection', () => {
            it('should detect card errors', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    errors: {
                        cardError: 'Card sync failed',
                    },
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.cardFeedErrors[cardFeed.feedNameWithDomainID]?.cardErrors[CARD_IDS.card1]).toEqual({
                    errors: {cardError: 'Card sync failed'},
                    errorFields: undefined,
                    pendingAction: undefined,
                });
            });

            it('should detect card errorFields', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    errorFields: {
                        cardName: {error: 'Invalid card name'},
                    },
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.cardFeedErrors[cardFeed.feedNameWithDomainID]?.cardErrors[CARD_IDS.card1]?.errorFields).toEqual({
                    cardName: {error: 'Invalid card name'},
                });
            });

            it('should detect card pendingAction', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.cardFeedErrors[cardFeed.feedNameWithDomainID]?.cardErrors[CARD_IDS.card1]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            });
        });

        describe('RBR mappings', () => {
            it('should set shouldShowRbrForWorkspaceAccountID correctly', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 403, // Broken connection
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.shouldShowRbrForWorkspaceAccountID[cardFeed.workspaceAccountID]).toBe(true);
            });

            it('should set shouldShowRbrForFeedNameWithDomainID correctly', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 403, // Broken connection
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.shouldShowRbrForFeedNameWithDomainID[cardFeed.feedNameWithDomainID]).toBe(true);
            });

            it('should not set RBR when no errors exist', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 200, // Success
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.shouldShowRbrForWorkspaceAccountID[cardFeed.workspaceAccountID]).toBe(false);
                expect(result.shouldShowRbrForFeedNameWithDomainID[cardFeed.feedNameWithDomainID]).toBe(false);
                expect(result.all.shouldShowRBR).toBe(false);
            });
        });

        describe('multiple feeds and workspaces', () => {
            it('should handle multiple feeds across different workspaces', () => {
                const cardFeed1 = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT];
                const cardFeed2 = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];
                const card1 = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed1.feedName,
                    fundID: String(cardFeed1.workspaceAccountID),
                    lastScrapeResult: 403, // Broken
                });

                const card2 = createCard({
                    cardID: CARD_IDS.card2,
                    bank: cardFeed2.feedName,
                    fundID: String(cardFeed2.workspaceAccountID),
                    lastScrapeResult: 200, // OK
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card1, [CARD_IDS.card2]: card2};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.shouldShowRbrForWorkspaceAccountID[cardFeed1.workspaceAccountID]).toBe(true);
                expect(result.shouldShowRbrForWorkspaceAccountID[cardFeed2.workspaceAccountID]).toBe(false);
                expect(result.all.isFeedConnectionBroken).toBe(true);
                expect(result.cardsWithBrokenFeedConnection).toHaveProperty(String(CARD_IDS.card1));
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty(String(CARD_IDS.card2));
            });

            it('should aggregate errors from both globalCardList and workspaceCards', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT];

                const globalCard = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 403,
                });

                const workspaceCard = createCard({
                    cardID: CARD_IDS.card2,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 401,
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: globalCard};
                const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                    [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${cardFeed.workspaceAccountID}_${cardFeed.feedNameWithDomainID}`]: createWorkspaceCardsList({
                        [CARD_IDS.card2]: workspaceCard,
                    }),
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, allWorkspaceCards, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.cardsWithBrokenFeedConnection).toHaveProperty(String(CARD_IDS.card1));
                expect(result.cardsWithBrokenFeedConnection).toHaveProperty(String(CARD_IDS.card2));
            });
        });

        describe('shouldShowRBR computation', () => {
            it('should return true when hasFeedErrors is true', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const cardFeeds: OnyxCollection<CardFeeds> = {
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${cardFeed.workspaceAccountID}`]: {
                        settings: {
                            companyCards: {
                                [cardFeed.feedName]: {
                                    pending: false,
                                    errors: {error: 'Feed error'},
                                },
                            },
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, cardFeeds], DERIVED_VALUE_CONTEXT);

                expect(result.all.shouldShowRBR).toBe(true);
            });

            it('should return true when hasFailedCardAssignment is true', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const failedAssignments: OnyxCollection<FailedCardAssignments> = {
                    [`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${cardFeed.workspaceAccountID}_${cardFeed.feedNameWithDomainID}`]: {
                        [String(CARD_IDS.card1)]: {
                            errors: {error: 'Assignment failed'},
                            errorFields: undefined,
                            pendingAction: undefined,
                            domainOrWorkspaceAccountID: cardFeed.workspaceAccountID,
                            bankName: cardFeed.feedName,
                            cardName: card.cardName ?? '',
                            encryptedCardNumber: card.encryptedCardNumber ?? '',
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, failedAssignments, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.shouldShowRBR).toBe(true);
            });

            it('should return true when isFeedConnectionBroken is true', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 403,
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.shouldShowRBR).toBe(true);
            });

            it('should return false when no errors exist', () => {
                const cardFeed = CARD_FEEDS[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE];

                const card = createCard({
                    cardID: CARD_IDS.card1,
                    bank: cardFeed.feedName,
                    fundID: String(cardFeed.workspaceAccountID),
                    lastScrapeResult: 200,
                });

                const globalCardList: CardList = {[CARD_IDS.card1]: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}], DERIVED_VALUE_CONTEXT);

                expect(result.all.shouldShowRBR).toBe(false);
            });
        });
    });
});
