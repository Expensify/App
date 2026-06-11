/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import {
    getCardFeedNamesWithType,
    getCardFeedsForDisplay,
    getCardFeedsForDisplayPerPolicy,
    getExpensifyCardFeedsForDisplay,
    getFeedInfo,
    getSelectedCardsFromFeeds,
} from '@libs/CardFeedUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Card, CardFeeds, CardList, CompanyCardFeed, Policy, WorkspaceCardsList} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function createTestCard(overrides: Partial<Card> & Pick<Card, 'cardID' | 'bank'>): Card {
    return {
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        domainName: 'test.com',
        fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
        lastUpdated: '',
        lastScrape: '',
        ...overrides,
    };
}

function createCardNameValuePairs(nameValuePairs: Partial<NonNullable<Card['nameValuePairs']>>): Card['nameValuePairs'] {
    return nameValuePairs as Card['nameValuePairs'];
}

function createTestPolicy(overrides: Partial<Policy> & Pick<Policy, 'id'>): Policy {
    return {
        name: 'Test Workspace',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'admin@test.com',
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: false,
        ...overrides,
    };
}

function createExpensifyCardBase(cardID: number, fundID: string, feedCountry?: string): Card {
    return createTestCard({
        accountID: cardID,
        lastUpdated: '2024-11-29',
        bank: CONST.EXPENSIFY_CARD.BANK,
        cardID,
        cardName: `${cardID}XXXXXX`,
        domainName: 'user.com',
        fundID,
        lastFourPAN: '1234',
        lastScrapeResult: 200,
        scrapeMinDate: '',
        ...(feedCountry ? {nameValuePairs: createCardNameValuePairs({feedCountry})} : {}),
    });
}

const cardFeedAmericaExpressMock: CardFeedWithNumber = `${CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT} 1001`;
const cardFeedVisaMock: CompanyCardFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
const cardFeedCitiBankMock: CompanyCardFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK;
const cardFeedStripeMock: CompanyCardFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;

const fakeWorkspace: Record<string, WorkspaceCardsList> = {
    'cards_11111111_Expensify Card': {
        '11111111': {
            accountID: 11111111,
            lastUpdated: '2024-11-29',
            bank: 'Expensify Card',
            cardID: 11111111,
            cardName: '111111XXXXXX1111',
            domainName: 'expensify-policy1234567891011121.exfy',
            fraud: 'none',
            fundID: '11111111',
            lastFourPAN: '1234',
            lastScrape: '',
            lastScrapeResult: 200,
            scrapeMinDate: '',
            state: 3,
        },
        '22222222': {
            accountID: 22222222,
            lastUpdated: '2024-11-29',
            bank: 'Expensify Card',
            cardID: 22222222,
            cardName: '222222XXXXXX2222',
            domainName: 'expensify-policy1234567891011121.exfy',
            fraud: 'none',
            fundID: '11111111',
            lastFourPAN: '5678',
            lastScrape: '',
            lastScrapeResult: 200,
            scrapeMinDate: '',
            state: 3,
        },
    },
    'cards_22222222_Expensify Card': {
        '33333333': {
            accountID: 33333333,
            lastUpdated: '2024-11-29',
            bank: 'Expensify Card',
            cardID: 33333333,
            cardName: '333333XXXXXX3333',
            domainName: 'expensify-policy1234567891011121.exfy',
            fraud: 'none',
            fundID: '22222222',
            lastFourPAN: '9101',
            lastScrape: '',
            lastScrapeResult: 200,
            scrapeMinDate: '',
            state: 3,
        },
    },
};

const cardListMock: CardList = {
    '11223344': createTestCard({cardID: 11223344, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA, fundID: '5555', state: CONST.EXPENSIFY_CARD.STATE.OPEN}),
    '10203040': createTestCard({cardID: 10203040, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555', state: CONST.EXPENSIFY_CARD.STATE.OPEN}),
};

const cardFeedsMock: OnyxCollection<CardFeeds> = {
    sharedNVP_private_domain_member_1234: {
        settings: {
            companyCardNicknames: {
                [cardFeedVisaMock]: 'Custom feed name',
            },
            companyCards: {
                [cardFeedAmericaExpressMock]: {},
                [cardFeedVisaMock]: {preferredPolicy: 'AA1BB2CC3'},
                [cardFeedCitiBankMock]: {preferredPolicy: 'AA1BB2CC3'},
                [cardFeedStripeMock]: {preferredPolicy: 'XX1YY2ZZ3'},
            },
            oAuthAccountDetails: {
                [cardFeedAmericaExpressMock]: {accountList: ['CREDIT CARD...1234'], credentials: 'xxxxx', expiration: 1730998958},
                [cardFeedCitiBankMock]: {accountList: ['CREDIT CARD...5678'], credentials: 'xxxxx', expiration: 1730998958},
            },
        },
    },
};

describe('Card Feed Utils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });
    it('returns display name of workspace & domain cards', () => {
        const cardFeedNamesWithType = getCardFeedNamesWithType({workspaceCardFeeds: fakeWorkspace, policies: undefined, translate: translateLocal});
        expect(Object.keys(cardFeedNamesWithType).length).toBe(2);
        expect(Object.values(cardFeedNamesWithType).every((cardFeedName) => cardFeedName.name === 'All Expensify')).toBe(true);
    });

    it('returns feeds to selected cards', () => {
        const feeds = ['22222222_Expensify Card'];
        const selected = getSelectedCardsFromFeeds({}, fakeWorkspace, feeds);
        expect(selected.length).toBe(1);
        expect(selected.at(0)).toEqual('33333333');
    });

    it('returns empty object when workspaceCardFeeds is empty', () => {
        const names = getCardFeedNamesWithType({workspaceCardFeeds: {key: {}}, policies: undefined, translate: translateLocal});
        expect(names).toEqual({});
    });

    it('returns empty array when selectedFeeds contains a non-existent feed', () => {
        const feeds = ['99999999_Expensify Card'];
        const selected = getSelectedCardsFromFeeds({}, fakeWorkspace, feeds);
        expect(selected).toEqual([]);
    });

    it('returns card feeds for display with custom names', () => {
        const cardFeedsForDisplay = getCardFeedsForDisplay(cardFeedsMock, cardListMock, translateLocal);
        expect(cardFeedsForDisplay).toEqual({
            '5555_Expensify Card': {id: '5555_Expensify Card', fundID: '5555', feed: 'Expensify Card', name: 'Expensify Card'},
            '1234_oauth.americanexpressfdx.com 1001': {id: '1234_oauth.americanexpressfdx.com 1001', fundID: '1234', feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express'},
            '1234_vcf': {id: '1234_vcf', fundID: '1234', feed: 'vcf', name: 'Custom feed name'},
            '1234_oauth.citibank.com': {id: '1234_oauth.citibank.com', fundID: '1234', feed: 'oauth.citibank.com', name: 'Citibank'},
            '1234_stripe': {id: '1234_stripe', fundID: '1234', feed: 'stripe', name: 'Stripe'},
        });
    });

    it('returns card feeds for display without Expensify Card', () => {
        const cardFeedsForDisplay = getCardFeedsForDisplay(cardFeedsMock, {}, translateLocal);
        expect(cardFeedsForDisplay).toEqual({
            '1234_oauth.americanexpressfdx.com 1001': {id: '1234_oauth.americanexpressfdx.com 1001', fundID: '1234', feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express'},
            '1234_vcf': {id: '1234_vcf', fundID: '1234', feed: 'vcf', name: 'Custom feed name'},
            '1234_oauth.citibank.com': {id: '1234_oauth.citibank.com', fundID: '1234', feed: 'oauth.citibank.com', name: 'Citibank'},
            '1234_stripe': {id: '1234_stripe', fundID: '1234', feed: 'stripe', name: 'Stripe'},
        });
    });

    it('returns card feeds grouped per policy', () => {
        const cardFeedsForDisplayPerPolicy = getCardFeedsForDisplayPerPolicy(cardFeedsMock, translateLocal, undefined, undefined);
        expect(cardFeedsForDisplayPerPolicy).toEqual({
            '': [
                {id: '1234_oauth.americanexpressfdx.com 1001', fundID: '1234', feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express', linkedPolicyIDs: undefined, country: ''},
            ],
            AA1BB2CC3: [
                {id: '1234_vcf', fundID: '1234', feed: 'vcf', name: 'Custom feed name', linkedPolicyIDs: undefined, country: ''},
                {id: '1234_oauth.citibank.com', fundID: '1234', feed: 'oauth.citibank.com', name: 'Citibank', linkedPolicyIDs: undefined, country: ''},
            ],
            XX1YY2ZZ3: [{id: '1234_stripe', fundID: '1234', feed: 'stripe', name: 'Stripe', linkedPolicyIDs: undefined, country: ''}],
        });
    });

    it('returns card feeds with country when feed has country in company cards settings', () => {
        const cardFeedsWithCountry: OnyxCollection<CardFeeds> = {
            sharedNVP_private_domain_member_1234: {
                settings: {
                    companyCardNicknames: {},
                    companyCards: {
                        [cardFeedVisaMock]: {preferredPolicy: 'POL1', country: 'US'},
                    },
                },
            },
        };
        const result = getCardFeedsForDisplayPerPolicy(cardFeedsWithCountry, translateLocal, undefined, undefined);
        expect(result.POL1).toHaveLength(1);
        expect(result.POL1?.at(0)?.country).toBe('US');
        expect(result.POL1?.at(0)?.id).toBe('1234_vcf');
    });

    it('returns card feeds with linkedPolicyIDs when feed has linkedPolicyIDs in company cards settings', () => {
        const linkedPolicyIDs = ['POLICY_A', 'POLICY_B'];
        const cardFeedsWithLinkedPolicies: OnyxCollection<CardFeeds> = {
            sharedNVP_private_domain_member_1234: {
                settings: {
                    companyCardNicknames: {},
                    companyCards: {
                        [cardFeedStripeMock]: {preferredPolicy: 'POL2', linkedPolicyIDs},
                    },
                },
            },
        };
        const result = getCardFeedsForDisplayPerPolicy(cardFeedsWithLinkedPolicies, translateLocal, undefined, undefined);
        expect(result.POLICY_A).toHaveLength(1);
        expect(result.POLICY_A?.at(0)?.linkedPolicyIDs).toEqual(linkedPolicyIDs);
        expect(result.POLICY_A?.at(0)?.id).toBe('1234_stripe');
        expect(result.POLICY_B).toHaveLength(1);
        expect(result.POLICY_B?.at(0)?.linkedPolicyIDs).toEqual(linkedPolicyIDs);
        expect(result.POLICY_B?.at(0)?.id).toBe('1234_stripe');
    });

    it('groups an orphan feed (no linkedPolicyIDs and no preferredPolicy) under a policy whose policyAccountID matches the fundID', () => {
        const orphanCardFeeds: OnyxCollection<CardFeeds> = {
            sharedNVP_private_domain_member_1234: {
                settings: {
                    companyCardNicknames: {},
                    companyCards: {
                        [cardFeedAmericaExpressMock]: {},
                    },
                },
            },
        };
        const policies: OnyxCollection<Policy> = {
            policy_ORPHAN: createTestPolicy({id: 'ORPHAN_WORKSPACE', policyAccountID: 1234}),
        };
        const result = getCardFeedsForDisplayPerPolicy(orphanCardFeeds, translateLocal, undefined, policies);
        expect(result.ORPHAN_WORKSPACE).toHaveLength(1);
        expect(result.ORPHAN_WORKSPACE?.at(0)?.id).toBe('1234_oauth.americanexpressfdx.com 1001');
        expect(result['']).toBeUndefined();
    });

    it('stores an orphan feed under the empty-string key when no policy matches the fundID', () => {
        const orphanCardFeeds: OnyxCollection<CardFeeds> = {
            sharedNVP_private_domain_member_1234: {
                settings: {
                    companyCardNicknames: {},
                    companyCards: {
                        [cardFeedAmericaExpressMock]: {},
                    },
                },
            },
        };
        const policies: OnyxCollection<Policy> = {
            policy_OTHER: createTestPolicy({id: 'OTHER_WORKSPACE', policyAccountID: 9999}),
        };
        const result = getCardFeedsForDisplayPerPolicy(orphanCardFeeds, translateLocal, undefined, policies);
        expect(result['']).toHaveLength(1);
        expect(result['']?.at(0)?.id).toBe('1234_oauth.americanexpressfdx.com 1001');
        expect(result.OTHER_WORKSPACE).toBeUndefined();
    });
});

describe('getFeedInfo', () => {
    const cardFeedsByPolicy = getCardFeedsForDisplayPerPolicy(cardFeedsMock, translateLocal, undefined, undefined);

    it('returns undefined when feedId is empty', () => {
        expect(getFeedInfo('', cardFeedsByPolicy)).toBeUndefined();
    });

    it('returns undefined when cardFeedsByPolicy is undefined', () => {
        expect(getFeedInfo('1234_vcf', undefined)).toBeUndefined();
    });

    it('returns undefined when cardFeedsByPolicy is empty', () => {
        expect(getFeedInfo('1234_vcf', {})).toBeUndefined();
    });

    it('returns undefined when feedId does not match any feed', () => {
        expect(getFeedInfo('9999_nonexistent', cardFeedsByPolicy)).toBeUndefined();
    });

    it('returns the feed when found in first policy', () => {
        const result = getFeedInfo('1234_oauth.americanexpressfdx.com 1001', cardFeedsByPolicy);
        expect(result).toEqual({
            id: '1234_oauth.americanexpressfdx.com 1001',
            fundID: '1234',
            feed: 'oauth.americanexpressfdx.com 1001',
            name: 'American Express',
            linkedPolicyIDs: undefined,
            country: '',
        });
    });

    it('returns the feed when found in another policy', () => {
        const result = getFeedInfo('1234_vcf', cardFeedsByPolicy);
        expect(result).toEqual({
            id: '1234_vcf',
            fundID: '1234',
            feed: 'vcf',
            name: 'Custom feed name',
            linkedPolicyIDs: undefined,
            country: '',
        });
    });

    it('returns the feed when id matches in policy with multiple feeds', () => {
        const result = getFeedInfo('1234_stripe', cardFeedsByPolicy);
        expect(result).toEqual({
            id: '1234_stripe',
            fundID: '1234',
            feed: 'stripe',
            name: 'Stripe',
            linkedPolicyIDs: undefined,
            country: '',
        });
    });
});

describe('getExpensifyCardFeedsForDisplay', () => {
    it('returns empty object when allCards is undefined', () => {
        expect(getExpensifyCardFeedsForDisplay(undefined, undefined)).toEqual({});
    });

    it('returns empty object when allCards is empty', () => {
        expect(getExpensifyCardFeedsForDisplay({}, undefined)).toEqual({});
    });

    it('returns empty object when no cards have Expensify Card bank', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA, fundID: '5555'}),
            '2': createTestCard({cardID: 2, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE, fundID: '6666'}),
        };

        expect(getExpensifyCardFeedsForDisplay(allCards, undefined)).toEqual({});
    });

    it('returns empty object when Expensify Cards have no fundID', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.EXPENSIFY_CARD.BANK, fundID: undefined}),
            '2': createTestCard({cardID: 2, bank: CONST.EXPENSIFY_CARD.BANK, fundID: ''}),
        };

        expect(getExpensifyCardFeedsForDisplay(allCards, undefined)).toEqual({});
    });

    it('returns a single feed entry for one Expensify Card with fundID', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555'}),
        };

        expect(getExpensifyCardFeedsForDisplay(allCards, undefined)).toEqual({
            '5555_Expensify Card': {id: '5555_Expensify Card', fundID: '5555', feed: CONST.EXPENSIFY_CARD.BANK, name: CONST.EXPENSIFY_CARD.BANK},
        });
    });

    it('deduplicates cards with the same fundID', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555'}),
            '2': createTestCard({cardID: 2, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555'}),
            '3': createTestCard({cardID: 3, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555'}),
        };

        const result = getExpensifyCardFeedsForDisplay(allCards, undefined);
        expect(Object.keys(result)).toHaveLength(1);
        expect(result['5555_Expensify Card']).toEqual({id: '5555_Expensify Card', fundID: '5555', feed: CONST.EXPENSIFY_CARD.BANK, name: CONST.EXPENSIFY_CARD.BANK});
    });

    it('returns separate entries for different fundIDs', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555'}),
            '2': createTestCard({cardID: 2, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '6666'}),
        };

        const result = getExpensifyCardFeedsForDisplay(allCards, undefined);
        expect(Object.keys(result)).toHaveLength(2);
        expect(result['5555_Expensify Card']).toEqual({id: '5555_Expensify Card', fundID: '5555', feed: CONST.EXPENSIFY_CARD.BANK, name: CONST.EXPENSIFY_CARD.BANK});
        expect(result['6666_Expensify Card']).toEqual({id: '6666_Expensify Card', fundID: '6666', feed: CONST.EXPENSIFY_CARD.BANK, name: CONST.EXPENSIFY_CARD.BANK});
    });

    it('filters out non-Expensify cards from mixed card list', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA, fundID: '5555'}),
            '2': createTestCard({cardID: 2, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '6666'}),
            '3': createTestCard({cardID: 3, bank: CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE, fundID: '7777'}),
        };

        const result = getExpensifyCardFeedsForDisplay(allCards, undefined);
        expect(Object.keys(result)).toHaveLength(1);
        expect(result['6666_Expensify Card']).toBeDefined();
    });

    it('skips Expensify Cards without fundID while keeping those with fundID', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.EXPENSIFY_CARD.BANK, fundID: undefined}),
            '2': createTestCard({cardID: 2, bank: CONST.EXPENSIFY_CARD.BANK, fundID: ''}),
            '3': createTestCard({cardID: 3, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '8888'}),
        };

        const result = getExpensifyCardFeedsForDisplay(allCards, undefined);
        expect(Object.keys(result)).toHaveLength(1);
        expect(result['8888_Expensify Card']).toBeDefined();
    });

    it('produces the same Expensify Card entries as getCardFeedsForDisplay', () => {
        const result = getExpensifyCardFeedsForDisplay(cardListMock, undefined);
        const fullResult = getCardFeedsForDisplay({}, cardListMock, translateLocal);

        expect(result).toEqual(fullResult);
    });

    it('appends country segment to the token for US-program Expensify Cards', () => {
        const allCards: CardList = {
            '1': createTestCard({cardID: 1, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555', nameValuePairs: createCardNameValuePairs({feedCountry: CONST.COUNTRY.US})}),
            '2': createTestCard({cardID: 2, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555', nameValuePairs: createCardNameValuePairs({feedCountry: CONST.COUNTRY.GB})}),
            '3': createTestCard({
                cardID: 3,
                bank: CONST.EXPENSIFY_CARD.BANK,
                fundID: '5555',
                nameValuePairs: createCardNameValuePairs({feedCountry: CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT}),
            }),
        };

        const result = getExpensifyCardFeedsForDisplay(allCards, translateLocal);
        expect(Object.keys(result)).toEqual(['5555_Expensify Card']);
        expect(result['5555_Expensify Card'].country).toBeUndefined();
        expect(result['5555_Expensify Card'].name).toBe(CONST.EXPENSIFY_CARD.BANK);
    });

    it('emits a separate Travel Invoicing entry when a travel card is present', () => {
        const allCards: CardList = {
            regular: createTestCard({cardID: 1, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555', nameValuePairs: createCardNameValuePairs({feedCountry: CONST.COUNTRY.US})}),
            travel: createTestCard({cardID: 2, bank: CONST.EXPENSIFY_CARD.BANK, fundID: '5555', nameValuePairs: createCardNameValuePairs({feedCountry: CONST.TRAVEL.PROGRAM_TRAVEL_US})}),
        };

        const result = getExpensifyCardFeedsForDisplay(allCards, translateLocal);
        expect(Object.keys(result).sort()).toEqual(['5555_Expensify Card', '5555_Expensify Card_TRAVEL_US']);
        expect(result['5555_Expensify Card_TRAVEL_US'].country).toBe(CONST.TRAVEL.PROGRAM_TRAVEL_US);
    });
});

describe('country-aware domain feed picker', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    it('feed names are different for Expensify Cards and Travel invoicing', () => {
        const workspaceCardFeeds: Record<string, WorkspaceCardsList> = {
            'cards_5555_Expensify Card': {
                '1': createExpensifyCardBase(1, '5555', CONST.COUNTRY.US),
                '2': createExpensifyCardBase(2, '5555', CONST.COUNTRY.GB),
            },
            'cards_5555_Expensify Card_TRAVEL_US': {
                '3': createExpensifyCardBase(3, '5555', CONST.TRAVEL.PROGRAM_TRAVEL_US),
            },
        };

        const names = getCardFeedNamesWithType({workspaceCardFeeds, policies: undefined, translate: translateLocal});
        expect(Object.keys(names).sort()).toEqual(['cards_5555_Expensify Card', 'cards_5555_Expensify Card_TRAVEL_US']);
        expect(names['cards_5555_Expensify Card'].name).toBe('All Expensify - user.com');
        expect(names['cards_5555_Expensify Card_TRAVEL_US'].name).toBe('All Travel invoicing - user.com');
    });

    it('resolves a travel selection to only travel cards', () => {
        const cardList: CardList = {
            '1': createExpensifyCardBase(1, '5555', CONST.COUNTRY.US),
            '2': createExpensifyCardBase(2, '5555', CONST.TRAVEL.PROGRAM_TRAVEL_US),
            '3': createExpensifyCardBase(3, '5555', CONST.TRAVEL.PROGRAM_TRAVEL_US),
        };

        const selected = getSelectedCardsFromFeeds(cardList, {}, ['5555_Expensify Card_TRAVEL_US']);
        expect(selected.sort()).toEqual(['2', '3']);
    });

    it('resolves a 2-segment Expensify selection to every non-travel card for the fundID', () => {
        const cardList: CardList = {
            '1': createExpensifyCardBase(1, '5555', CONST.COUNTRY.US),
            '2': createExpensifyCardBase(2, '5555', CONST.COUNTRY.GB),
            '3': createExpensifyCardBase(3, '5555', CONST.TRAVEL.PROGRAM_TRAVEL_US),
        };

        const selected = getSelectedCardsFromFeeds(cardList, {}, ['5555_Expensify Card']);
        expect(selected.sort()).toEqual(['1', '2']);
    });

    it('still resolves a 2-segment selection when cards carry no feedCountry', () => {
        const cardList: CardList = {
            '1': createExpensifyCardBase(1, '5555'),
            '2': createExpensifyCardBase(2, '5555'),
        };

        const selected = getSelectedCardsFromFeeds(cardList, {}, ['5555_Expensify Card']);
        expect(selected.sort()).toEqual(['1', '2']);
    });

    it('keeps the travel workspace feed visible when the only domain entry is a regular Expensify Card', () => {
        const workspaceCardFeeds: Record<string, WorkspaceCardsList> = {
            'cards_5555_Expensify Card': {
                '1': {...createExpensifyCardBase(1, '5555', CONST.COUNTRY.US), domainName: 'user.com'},
                '2': {...createExpensifyCardBase(2, '5555', CONST.COUNTRY.US), domainName: 'expensify-policy1234567891011121.exfy'},
            },
            'cards_5555_Expensify Card_TRAVEL_US': {
                '3': {...createExpensifyCardBase(3, '5555', CONST.TRAVEL.PROGRAM_TRAVEL_US), domainName: 'expensify-policy1234567891011121.exfy'},
            },
        };

        const names = getCardFeedNamesWithType({workspaceCardFeeds, policies: undefined, translate: translateLocal});
        expect(Object.keys(names)).toContain('cards_5555_Expensify Card_TRAVEL_US');
        expect(names['cards_5555_Expensify Card_TRAVEL_US'].type).toBe('workspace');
        expect(Object.keys(names)).toContain('cards_5555_Expensify Card');
        expect(names['cards_5555_Expensify Card'].type).toBe('domain');
    });
});
