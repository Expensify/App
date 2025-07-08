/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import {getCardFeedNamesWithType, getCardFeedsForDisplay, getSelectedCardsFromFeeds} from '@libs/CardFeedUtils';
import {translateLocal} from '@libs/Localize';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {CardFeeds, CardList, CompanyCardFeed, WorkspaceCardsList} from '@src/types/onyx';
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
        lastFourPAN: '1234',
    },
    '10203040': {
        state: 1,
        bank: CONST.EXPENSIFY_CARD.BANK,
        lastFourPAN: '1234',
    },
} as unknown as CardList;

const cardFeedAmericaExpressMock = 'oauth.americanexpressfdx.com 1001' as CompanyCardFeed;
const cardFeedVisaMock = 'vcf' as CompanyCardFeed;
const cardFeedsMock: OnyxCollection<CardFeeds> = {
    sharedNVP_private_domain_member_1234: {
        settings: {
            companyCardNicknames: {
                [cardFeedVisaMock]: 'Custom feed name',
            },
            companyCards: {
                [cardFeedAmericaExpressMock]: {},
                [cardFeedVisaMock]: {},
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
            'Expensify Card': {feed: 'Expensify Card', name: 'Expensify Card'},
            'oauth.americanexpressfdx.com 1001': {feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express'},
            vcf: {feed: 'vcf', name: 'Custom feed name'},
        });
    });

    it('returns card feeds for display without Expensify Card', () => {
        const cardFeedsForDisplay = getCardFeedsForDisplay(cardFeedsMock, {});
        expect(cardFeedsForDisplay).toEqual({
            'oauth.americanexpressfdx.com 1001': {feed: 'oauth.americanexpressfdx.com 1001', name: 'American Express'},
            vcf: {feed: 'vcf', name: 'Custom feed name'},
        });
    });
});
