/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import {getCardFeedNamesWithType, getCardFeedsForDisplay, getCardFeedsForDisplayPerPolicy, getSelectedCardsFromFeeds} from '@libs/CardFeedUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {CardFeeds, CardList, CompanyCardFeedBankName, WorkspaceCardsList} from '@src/types/onyx';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

const cardListMock = {
    '11223344': {
        state: 1,
        bank: 'vcf',
        fundID: '5555',
        lastFourPAN: '1234',
    },
    '10203040': {
        state: 1,
        bank: CONST.EXPENSIFY_CARD.BANK,
        fundID: '5555',
        lastFourPAN: '1234',
    },
} as unknown as CardList;

const cardFeedAmericaExpressMock = 'oauth.americanexpressfdx.com 1001' as CompanyCardFeedBankName;
const cardFeedVisaMock = 'vcf' as CompanyCardFeedBankName;
const cardFeedCitiBankMock = 'oauth.citibank.com' as CompanyCardFeedBankName;
const cardFeedStripeMock = 'stripe' as CompanyCardFeedBankName;
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
        },
    },
};

describe('Card Feed Utils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });
    it('returns display name of workspace & domain cards', () => {
        const cardFeedNamesWithType = getCardFeedNamesWithType({workspaceCardFeeds: fakeWorkspace, translate: translateLocal});
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
        const names = getCardFeedNamesWithType({workspaceCardFeeds: {key: {}}, translate: translateLocal});
        expect(names).toEqual({});
    });

    it('returns empty array when selectedFeeds contains a non-existent feed', () => {
        const feeds = ['99999999_Expensify Card'];
        const selected = getSelectedCardsFromFeeds({}, fakeWorkspace, feeds);
        expect(selected).toEqual([]);
    });

    it('returns card feeds for display with custom names', () => {
        const cardFeedsForDisplay = getCardFeedsForDisplay(cardFeedsMock, cardListMock);
        expect(cardFeedsForDisplay).toEqual({
            '5555_Expensify Card': {id: '5555_Expensify Card', fundID: '5555', feed: 'Expensify Card', name: 'Expensify Card'},
            '1234_oauth.americanexpressfdx.com 1001': {id: '1234_oauth.americanexpressfdx.com 1001', fundID: '1234', feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express'},
            '1234_vcf': {id: '1234_vcf', fundID: '1234', feed: 'vcf', name: 'Custom feed name'},
            '1234_oauth.citibank.com': {id: '1234_oauth.citibank.com', fundID: '1234', feed: 'oauth.citibank.com', name: 'Citibank'},
            '1234_stripe': {id: '1234_stripe', fundID: '1234', feed: 'stripe', name: 'Stripe'},
        });
    });

    it('returns card feeds for display without Expensify Card', () => {
        const cardFeedsForDisplay = getCardFeedsForDisplay(cardFeedsMock, {});
        expect(cardFeedsForDisplay).toEqual({
            '1234_oauth.americanexpressfdx.com 1001': {id: '1234_oauth.americanexpressfdx.com 1001', fundID: '1234', feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express'},
            '1234_vcf': {id: '1234_vcf', fundID: '1234', feed: 'vcf', name: 'Custom feed name'},
            '1234_oauth.citibank.com': {id: '1234_oauth.citibank.com', fundID: '1234', feed: 'oauth.citibank.com', name: 'Citibank'},
            '1234_stripe': {id: '1234_stripe', fundID: '1234', feed: 'stripe', name: 'Stripe'},
        });
    });

    it('returns card feeds grouped per policy', () => {
        const cardFeedsForDisplayPerPolicy = getCardFeedsForDisplayPerPolicy(cardFeedsMock);
        expect(cardFeedsForDisplayPerPolicy).toEqual({
            '': [{id: '1234_oauth.americanexpressfdx.com 1001', fundID: '1234', feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express'}],
            AA1BB2CC3: [
                {id: '1234_vcf', fundID: '1234', feed: 'vcf', name: 'Custom feed name'},
                {id: '1234_oauth.citibank.com', fundID: '1234', feed: 'oauth.citibank.com', name: 'Citibank'},
            ],
            XX1YY2ZZ3: [{id: '1234_stripe', fundID: '1234', feed: 'stripe', name: 'Stripe'}],
        });
    });
});
