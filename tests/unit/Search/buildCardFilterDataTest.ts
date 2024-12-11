// The cards_ object keys don't follow normal naming convention, so to test this reliably we have to disable liner

/* eslint-disable @typescript-eslint/naming-convention */
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import {buildCardFeedsData, buildIndividualCardsData} from '@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCardPage';
import type {CardList, WorkspaceCardsList} from '@src/types/onyx';

jest.mock('@libs/PolicyUtils', () => {
    return {
        getPolicy(policyID: string) {
            switch (policyID) {
                case '1':
                    return {name: ''};
                case '2':
                    return {name: 'test1'};
                case '3':
                    return {name: 'test2'};
                default:
                    return {name: ''};
            }
        },
    };
});

const workspaceCardFeeds = {
    cards_18680694_vcf: {
        '21593492': {
            accountID: 1,
            bank: 'vcf',
            cardID: 21593492,
            cardName: '480801XXXXXX9411',
            domainName: 'expensify-policy1.exfy',
            lastFourPAN: '9411',
        },
        '21604933': {
            accountID: 1,
            bank: 'vcf',
            cardID: 21604933,
            cardName: '480801XXXXXX1601',
            domainName: 'expensify-policy1.exfy',
            lastFourPAN: '1601',
        },
        '21638320': {
            accountID: 1,
            bank: 'vcf',
            cardID: 21638320,
            cardName: '480801XXXXXX2617',
            domainName: 'expensify-policy1.exfy',
            lastFourPAN: '2617',
        },
        '21638598': {
            accountID: 1,
            bank: 'vcf',
            cardID: 21638598,
            cardName: '480801XXXXXX2111',
            domainName: 'expensify-policy1.exfy',
            lastFourPAN: '2111',
        },
        cardList: {
            test: '231:1111111',
        },
    },
    'cards_18755165_Expensify Card': {
        '21588678': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21588678,
            cardName: '455594XXXXXX1138',
            domainName: 'expensify-policy2.exfy',
            lastFourPAN: '1138',
        },
        '21588684': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21588684,
            cardName: '',
            domainName: 'expensify-policy2.exfy',
            lastFourPAN: '',
        },
    },
    'cards_11111_Expensify Card': {
        '21589168': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21589168,
            cardName: '455594XXXXXX4163',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '4163',
        },
        '21589182': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21589182,
            cardName: '',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '',
        },
        '21589202': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21589202,
            cardName: '455594XXXXXX6232',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '6232',
        },
        '21638322': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21638322,
            cardName: '',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '',
        },
    },
};

const cardList = {
    '21588678': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21588678,
        cardName: '455594XXXXXX1138',
        domainName: 'expensify-policy2.exfy',
        lastFourPAN: '1138',
    },
    '21588684': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21588684,
        cardName: '',
        domainName: 'expensify-policy2.exfy',
        lastFourPAN: '',
    },
    '21589202': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21589202,
        cardName: '455594XXXXXX6232',
        domainName: 'expensify-policy3.exfy',
        lastFourPAN: '6232',
    },
    '21604933': {
        accountID: 1,
        bank: 'vcf',
        cardID: 21604933,
        cardName: '480801XXXXXX1601',
        domainName: 'expensify-policy1.exfy',
        lastFourPAN: '1601',
    },
    '11111111': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 11111111,
        cardName: '455594XXXXXX1138',
        domainName: 'testDomain',
        lastFourPAN: '1138',
    },
};

const domainFeedData = {testDomain: {domainName: 'testDomain', bank: 'Expensify Card', correspondingCardIDs: ['11111111']}};

function translateMock(key: string, obj: {cardFeedBankName: string; cardFeedLabel: string}) {
    if (key === 'search.filters.card.expensify') {
        return 'Expensify';
    }
    return `All ${obj.cardFeedBankName}${obj.cardFeedLabel ? ` - ${obj.cardFeedLabel}` : ''}`;
}

describe('Build individual cards data from given cardList and workspaceCardFeeds objects', () => {
    const result = buildIndividualCardsData(workspaceCardFeeds as unknown as Record<string, WorkspaceCardsList | undefined>, cardList as unknown as CardList, ['21588678'], {});

    it("Builds all individual cards and doesn't generate duplicates", () => {
        expect(result.length).toEqual(11);
    });

    it('Builds expensify card data properly', () => {
        const expensifyCard = result.find((card) => card.keyForList === '21588678');
        expect(expensifyCard).toMatchObject({
            text: 'Expensify Card',
            lastFourPAN: '1138',
            isSelected: true,
        });
    });

    it('Builds company card data properly', () => {
        const companyCard = result.find((card) => card.keyForList === '21604933');
        expect(companyCard).toMatchObject({
            text: '480801XXXXXX1601',
            lastFourPAN: '1601',
            isSelected: false,
        });
    });
});

describe('Build card feed data from given domainFeedData and workspaceCardFeeds objects', () => {
    const result = buildCardFeedsData(
        workspaceCardFeeds as unknown as Record<string, WorkspaceCardsList | undefined>,
        domainFeedData,
        [],
        {},
        translateMock as LocaleContextProps['translate'],
    );

    it('Buids domain card feed properly', () => {
        expect(result.at(0)).toMatchObject({
            text: 'All Expensify - testDomain',
            isCardFeed: true,
            correspondingCards: ['11111111'],
        });
    });

    it('Buids workspace card feed from company card feed properly', () => {
        expect(result.at(1)).toMatchObject({
            text: 'All Visa',
            isCardFeed: true,
            correspondingCards: ['21593492', '21604933', '21638320', '21638598'],
        });
    });

    it('Buids "test1" workspace card feed from expensify card feed(there are two expensify card feeds) properly', () => {
        expect(result.at(2)).toMatchObject({
            text: 'All Expensify - test1',
            isCardFeed: true,
            correspondingCards: ['21588678', '21588684'],
        });
    });

    it('Buids "test2" workspace card feed from expensify card feed(there are tow expensify card feeds) properly', () => {
        expect(result.at(3)).toMatchObject({
            text: 'All Expensify - test2',
            isCardFeed: true,
            correspondingCards: ['21589168', '21589182', '21589202', '21638322'],
        });
    });
});
