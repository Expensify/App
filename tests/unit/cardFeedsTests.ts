import {getCardFeedNames, getSelectedCardsFromFeeds} from '@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCardPage';
import type {WorkspaceCardsList} from '@src/types/onyx';

/* eslint-disable @typescript-eslint/naming-convention */
const fakeWorkspace: Record<string, WorkspaceCardsList> = {
    'cards_11111111_Expensify Card': {
        '11111111': {
            accountID: 11111111,
            lastUpdated: '2024-11-29',
            bank: 'Expensify Card',
            cardID: 11111111,
            cardName: '111111XXXXXX1111',
            domainName: 'expensify-policyxxxxxxxxxxxxxxxx.exfy',
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
            domainName: 'expensify-policyxxxxxxxxxxxxxxxx.exfy',
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
            domainName: 'expensify-policyxxxxxxxxxxxxxxxx.exfy',
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

describe('Card Feeds convertion (workspace & domain)', () => {
    it('Fetches display name of workspace & domain cards', () => {
        const names = getCardFeedNames(fakeWorkspace, {});
        expect(Object.keys(names).length).toBe(2);
        expect(Object.values(names).every((name) => name === 'All Expensify')).toBe(true);
    });

    it('Converts feeds to selected cards', () => {
        const feeds = ['22222222_Expensify Card'];
        const selected = getSelectedCardsFromFeeds(fakeWorkspace, feeds);
        expect(selected.length).toBe(1);
        expect(selected.at(0)).toEqual('33333333');
    });
});
