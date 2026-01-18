import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import cardFeedErrorsConfig from '@src/libs/actions/OnyxDerived/configs/cardFeedErrors';
import type {Card, CardFeeds, CardList, FailedCompanyCardAssignments, WorkspaceCardsList} from '@src/types/onyx';

// Helper to create a card with specified properties
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
            const result = cardFeedErrorsConfig.compute([{}, {}, {}, {}]);

            expect(result.cardFeedErrors).toEqual({});
            expect(result.cardsWithBrokenFeedConnection).toEqual({});
            expect(result.shouldShowRBR).toBe(false);
            expect(result.isFeedConnectionBroken).toBe(false);
            expect(result.hasFeedErrors).toBe(false);
            expect(result.hasWorkspaceErrors).toBe(false);
            expect(result.hasFailedCardAssignment).toBe(false);
        });

        it('should return empty errors when all inputs are undefined', () => {
            const result = cardFeedErrorsConfig.compute([undefined, undefined, undefined, undefined]);

            expect(result.cardFeedErrors).toEqual({});
            expect(result.shouldShowRBR).toBe(false);
        });

        describe('broken feed connection detection', () => {
            it('should detect broken connection when lastScrapeResult is not in ignored statuses', () => {
                const workspaceAccountID = 11111111;
                const card = createCard({
                    cardID: 123,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 403, // Not in BROKEN_CONNECTION_IGNORED_STATUSES
                });

                const globalCardList: CardList = {123: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.isFeedConnectionBroken).toBe(true);
                expect(result.shouldShowRBR).toBe(true);
                expect(result.cardsWithBrokenFeedConnection['123']).toEqual(card);
            });

            it('should NOT detect broken connection when lastScrapeResult is 200 (success)', () => {
                const workspaceAccountID = 11111111;
                const card = createCard({
                    cardID: 123,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 200,
                });

                const globalCardList: CardList = {123: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.isFeedConnectionBroken).toBe(false);
                expect(result.cardsWithBrokenFeedConnection).toEqual({});
            });

            it.each([200, 531, 530, 500, 666])('should NOT detect broken connection when lastScrapeResult is %s (ignored status)', (status) => {
                const workspaceAccountID = 11111111;
                const card = createCard({
                    cardID: 123,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: status,
                });

                const globalCardList: CardList = {123: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.isFeedConnectionBroken).toBe(false);
            });

            it('should NOT detect broken connection when lastScrapeResult is undefined', () => {
                const workspaceAccountID = 11111111;
                const card = createCard({
                    cardID: 123,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: undefined,
                });

                const globalCardList: CardList = {123: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.isFeedConnectionBroken).toBe(false);
            });
        });

        describe('processing cards from workspace cards collection', () => {
            it('should process cards from allWorkspaceCards', () => {
                const workspaceAccountID = 22222222;
                const card = createCard({
                    cardID: 456,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 401, // Broken connection
                });

                const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                    [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE}`]: createWorkspaceCardsList({456: card}),
                };

                const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}, {}]);

                expect(result.isFeedConnectionBroken).toBe(true);
                expect(result.cardsWithBrokenFeedConnection['456']).toEqual(card);
            });

            it('should filter out inactive cards (closed, deactivated, suspended)', () => {
                const workspaceAccountID = 33333333;

                const closedCard = createCard({
                    cardID: 1,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    state: CONST.EXPENSIFY_CARD.STATE.CLOSED,
                    lastScrapeResult: 403,
                });

                const deactivatedCard = createCard({
                    cardID: 2,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    state: CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED,
                    lastScrapeResult: 403,
                });

                const suspendedCard = createCard({
                    cardID: 3,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    state: CONST.EXPENSIFY_CARD.STATE.STATE_SUSPENDED,
                    lastScrapeResult: 403,
                });

                const activeCard = createCard({
                    cardID: 4,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    fundID: workspaceAccountID.toString(),
                    state: CONST.EXPENSIFY_CARD.STATE.OPEN,
                    lastScrapeResult: 403,
                });

                const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                    [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}`]: createWorkspaceCardsList({
                        1: closedCard,
                        2: deactivatedCard,
                        3: suspendedCard,
                        4: activeCard,
                    }),
                };

                const result = cardFeedErrorsConfig.compute([{}, allWorkspaceCards, {}, {}]);

                // Only the active card should be processed and detected as broken
                expect(result.cardsWithBrokenFeedConnection).toHaveProperty('4');
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty('1');
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty('2');
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty('3');
            });
        });

        describe('failed card assignments detection', () => {
            it('should detect failed card assignments', () => {
                const workspaceAccountID = 44444444;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 789,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                });

                const globalCardList: CardList = {789: card};

                const failedAssignments: OnyxCollection<FailedCompanyCardAssignments> = {
                    [`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${workspaceAccountID}_${feedNameWithDomainID}`]: {
                        someCardNumber: {
                            errors: {error1: 'Failed to assign card'},
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, failedAssignments, {}]);

                expect(result.hasFailedCardAssignment).toBe(true);
                expect(result.shouldShowRBR).toBe(true);
                expect(result.cardFeedErrors[feedNameWithDomainID]?.hasFailedCardAssignments).toBe(true);
            });

            it('should NOT detect failed card assignments when empty', () => {
                const workspaceAccountID = 44444444;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

                const card = createCard({
                    cardID: 789,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                });

                const globalCardList: CardList = {789: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.hasFailedCardAssignment).toBe(false);
            });
        });

        describe('feed errors detection', () => {
            it('should detect feed errors from cardFeeds', () => {
                const workspaceAccountID = 55555555;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 101,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                });

                const globalCardList: CardList = {101: card};

                const cardFeeds: OnyxCollection<CardFeeds> = {
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`]: {
                        settings: {
                            companyCards: {
                                [feedName]: {
                                    pending: false,
                                    errors: {
                                        feedError: 'Connection failed',
                                    },
                                },
                            },
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, cardFeeds]);

                expect(result.hasFeedErrors).toBe(true);
                expect(result.shouldShowRBR).toBe(true);
                expect(result.cardFeedErrors[feedNameWithDomainID]?.hasFeedErrors).toBe(true);
                expect(result.cardFeedErrors[feedNameWithDomainID]?.feedErrors).toEqual({feedError: 'Connection failed'});
            });
        });

        describe('workspace errors detection', () => {
            it('should detect workspace errors', () => {
                const workspaceAccountID = 66666666;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.BREX;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 202,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                });

                const globalCardList: CardList = {202: card};

                const cardFeeds: OnyxCollection<CardFeeds> = {
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`]: {
                        errors: {
                            workspaceError: 'Workspace connection issue',
                        },
                        settings: {
                            companyCards: {
                                [feedName]: {
                                    pending: false,
                                },
                            },
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, cardFeeds]);

                expect(result.hasWorkspaceErrors).toBe(true);
                expect(result.cardFeedErrors[feedNameWithDomainID]?.hasWorkspaceErrors).toBe(true);
            });
        });

        describe('card-level errors detection', () => {
            it('should detect card errors', () => {
                const workspaceAccountID = 77777777;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 303,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    errors: {
                        cardError: 'Card sync failed',
                    },
                });

                const globalCardList: CardList = {303: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.cardFeedErrors[feedNameWithDomainID]?.cardErrors['303']).toEqual({
                    errors: {cardError: 'Card sync failed'},
                    errorFields: undefined,
                    pendingAction: undefined,
                });
            });

            it('should detect card errorFields', () => {
                const workspaceAccountID = 77777777;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 304,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    errorFields: {
                        cardName: {error: 'Invalid card name'},
                    },
                });

                const globalCardList: CardList = {304: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.cardFeedErrors[feedNameWithDomainID]?.cardErrors['304']?.errorFields).toEqual({
                    cardName: {error: 'Invalid card name'},
                });
            });

            it('should detect card pendingAction', () => {
                const workspaceAccountID = 77777777;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 305,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                });

                const globalCardList: CardList = {305: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.cardFeedErrors[feedNameWithDomainID]?.cardErrors['305']?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            });
        });

        describe('RBR mappings', () => {
            it('should set rbrWorkspaceAccountIDMapping correctly', () => {
                const workspaceAccountID = 88888888;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO;

                const card = createCard({
                    cardID: 404,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 403, // Broken connection
                });

                const globalCardList: CardList = {404: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.rbrWorkspaceAccountIDMapping[workspaceAccountID]).toBe(true);
            });

            it('should set rbrFeedNameWithDomainIDMapping correctly', () => {
                const workspaceAccountID = 99999999;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 505,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 403, // Broken connection
                });

                const globalCardList: CardList = {505: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.rbrFeedNameWithDomainIDMapping[feedNameWithDomainID]).toBe(true);
            });

            it('should not set RBR when no errors exist', () => {
                const workspaceAccountID = 10101010;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 606,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 200, // Success
                });

                const globalCardList: CardList = {606: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.rbrWorkspaceAccountIDMapping[workspaceAccountID]).toBe(false);
                expect(result.rbrFeedNameWithDomainIDMapping[feedNameWithDomainID]).toBe(false);
                expect(result.shouldShowRBR).toBe(false);
            });
        });

        describe('multiple feeds and workspaces', () => {
            it('should handle multiple feeds across different workspaces', () => {
                const workspace1 = 11111111;
                const workspace2 = 22222222;
                const feed1 = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
                const feed2 = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;

                const card1 = createCard({
                    cardID: 1,
                    bank: feed1,
                    fundID: workspace1.toString(),
                    lastScrapeResult: 403, // Broken
                });

                const card2 = createCard({
                    cardID: 2,
                    bank: feed2,
                    fundID: workspace2.toString(),
                    lastScrapeResult: 200, // OK
                });

                const globalCardList: CardList = {1: card1, 2: card2};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.rbrWorkspaceAccountIDMapping[workspace1]).toBe(true);
                expect(result.rbrWorkspaceAccountIDMapping[workspace2]).toBe(false);
                expect(result.isFeedConnectionBroken).toBe(true);
                expect(result.cardsWithBrokenFeedConnection).toHaveProperty('1');
                expect(result.cardsWithBrokenFeedConnection).not.toHaveProperty('2');
            });

            it('should aggregate errors from both globalCardList and workspaceCards', () => {
                const workspaceAccountID = 33333333;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT;

                const globalCard = createCard({
                    cardID: 1,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 403,
                });

                const workspaceCard = createCard({
                    cardID: 2,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 401,
                });

                const globalCardList: CardList = {1: globalCard};
                const allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {
                    [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${feedName}`]: createWorkspaceCardsList({2: workspaceCard}),
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, allWorkspaceCards, {}, {}]);

                expect(result.cardsWithBrokenFeedConnection).toHaveProperty('1');
                expect(result.cardsWithBrokenFeedConnection).toHaveProperty('2');
            });
        });

        describe('shouldShowRBR computation', () => {
            it('should return true when hasFeedErrors is true', () => {
                const workspaceAccountID = 12121212;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

                const card = createCard({
                    cardID: 1,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                });

                const globalCardList: CardList = {1: card};

                const cardFeeds: OnyxCollection<CardFeeds> = {
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`]: {
                        settings: {
                            companyCards: {
                                [feedName]: {
                                    pending: false,
                                    errors: {error: 'Feed error'},
                                },
                            },
                        },
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, cardFeeds]);

                expect(result.shouldShowRBR).toBe(true);
            });

            it('should return true when hasFailedCardAssignment is true', () => {
                const workspaceAccountID = 13131313;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD;
                const feedNameWithDomainID = `${feedName}#${workspaceAccountID}`;

                const card = createCard({
                    cardID: 1,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                });

                const globalCardList: CardList = {1: card};

                const failedAssignments: OnyxCollection<FailedCompanyCardAssignments> = {
                    [`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${workspaceAccountID}_${feedNameWithDomainID}`]: {
                        cardNumber: {errors: {error: 'Assignment failed'}},
                    },
                };

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, failedAssignments, {}]);

                expect(result.shouldShowRBR).toBe(true);
            });

            it('should return true when isFeedConnectionBroken is true', () => {
                const workspaceAccountID = 14141414;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;

                const card = createCard({
                    cardID: 1,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 403,
                });

                const globalCardList: CardList = {1: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.shouldShowRBR).toBe(true);
            });

            it('should return false when no errors exist', () => {
                const workspaceAccountID = 15151515;
                const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE;

                const card = createCard({
                    cardID: 1,
                    bank: feedName,
                    fundID: workspaceAccountID.toString(),
                    lastScrapeResult: 200,
                });

                const globalCardList: CardList = {1: card};

                const result = cardFeedErrorsConfig.compute([globalCardList, {}, {}, {}]);

                expect(result.shouldShowRBR).toBe(false);
            });
        });
    });

    describe('dependencies', () => {
        it('should have correct dependencies defined', () => {
            expect(cardFeedErrorsConfig.dependencies).toEqual([
                ONYXKEYS.CARD_LIST,
                ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST,
                ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS,
                ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER,
            ]);
        });
    });

    describe('key', () => {
        it('should have correct key defined', () => {
            expect(cardFeedErrorsConfig.key).toBe(ONYXKEYS.DERIVED.CARD_FEED_ERRORS);
        });
    });
});
