"use strict";
// The cards_ object keys don't follow normal naming convention, so to test this reliably we have to disable liner
Object.defineProperty(exports, "__esModule", { value: true });
var CardFeedUtils_1 = require("@libs/CardFeedUtils");
// eslint-disable-next-line no-restricted-syntax
var PolicyUtils = require("@libs/PolicyUtils");
jest.mock('@src/components/ConfirmedRoute.tsx');
// Use jest.spyOn to mock the implementation
jest.spyOn(PolicyUtils, 'getPolicy').mockImplementation(function (policyID) {
    switch (policyID) {
        case '1':
            return { name: '' };
        case '2':
            return { name: 'test1' };
        case '3':
            return { name: 'test2' };
        default:
            return { name: '' };
    }
});
var workspaceCardFeeds = {
    cards_18680694_vcf: {
        '21593492': {
            accountID: 1,
            bank: 'vcf',
            fundID: '18680694',
            cardID: 21593492,
            cardName: '480801XXXXXX9411',
            domainName: 'expensify-policy1.exfy',
            lastFourPAN: '9411',
        },
        '21604933': {
            accountID: 1,
            bank: 'vcf',
            fundID: '18680694',
            cardID: 21604933,
            cardName: '480801XXXXXX1601',
            domainName: 'expensify-policy1.exfy',
            lastFourPAN: '1601',
        },
        '21638320': {
            accountID: 1,
            bank: 'vcf',
            fundID: '18680694',
            cardID: 21638320,
            cardName: '480801XXXXXX2617',
            domainName: 'expensify-policy1.exfy',
            lastFourPAN: '2617',
        },
        '21638598': {
            accountID: 1,
            bank: 'vcf',
            fundID: '18680694',
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
            fundID: '18755165',
            cardID: 21588678,
            cardName: '455594XXXXXX1138',
            domainName: 'expensify-policy2.exfy',
            lastFourPAN: '1138',
        },
        '21588684': {
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755165',
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
            fundID: '18755166',
            cardID: 21589168,
            cardName: '455594XXXXXX4163',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '4163',
        },
        '21589182': {
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755166',
            cardID: 21589182,
            cardName: '',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '',
        },
        '21589202': {
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755166',
            cardID: 21589202,
            cardName: '455594XXXXXX6232',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '6232',
        },
        '21638322': {
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755166',
            cardID: 21638322,
            cardName: '',
            domainName: 'expensify-policy3.exfy',
            lastFourPAN: '',
        },
    },
    'cards_11111212_Expensify Card': {
        '21589168': {
            accountID: 1,
            bank: 'Expensify Card',
            fundID: '18755167',
            cardID: 21589168,
            cardName: '455594XXXXXX4163',
            domainName: 'mockDomain.com',
            lastFourPAN: '4163',
        },
        '21589182': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21589182,
            cardName: '',
            domainName: 'mockDomain.com',
            lastFourPAN: '',
        },
    },
};
var cardList = {
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
var workspaceCardFeedsHiddenOnSearch = {
    'cards_11111_Expensify Card': {
        '21534278': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21534278,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: { cardTitle: 'Not Issued card' },
            isVirtual: false,
            lastFourPAN: '',
            state: 2, // STATE_NOT_ISSUED
        },
        '21539025': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21539025,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: { cardTitle: 'Not activated card' },
            isVirtual: false,
            lastFourPAN: '',
            state: 4, // NOT_ACTIVATED
        },
    },
};
var cardListHiddenOnSearch = {
    '21534538': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534538,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: { cardTitle: 'Not Issued card' },
        isVirtual: false,
        lastFourPAN: '',
        state: 2, // STATE_NOT_ISSUED
    },
    '21534525': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534525,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: { cardTitle: 'Not activated card' },
        isVirtual: false,
        lastFourPAN: '',
        state: 4, // NOT_ACTIVATED
    },
};
var workspaceCardFeedsClosed = {
    'cards_11111_Expensify Card': {
        '21534278': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21534278,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: { cardTitle: 'Not Issued card' },
            isVirtual: false,
            lastFourPAN: '1234',
            state: 6, // CLOSED
        },
        '21539012': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21539012,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: { cardTitle: 'Not activated card' },
            isVirtual: false,
            lastFourPAN: '3211',
            state: 6, // CLOSED
        },
        '21539027': {
            accountID: 1,
            bank: 'Expensify Card',
            cardID: 21539027,
            domainName: 'expensify-policy1.exfy',
            nameValuePairs: { cardTitle: 'Not activated card' },
            isVirtual: false,
            lastFourPAN: '',
            state: 3, // OPEN
        },
    },
};
var cardListClosed = {
    '21534538': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534538,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: { cardTitle: 'Not Issued card' },
        isVirtual: false,
        lastFourPAN: '',
        state: 6, // CLOSED
    },
    '21534525': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534525,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: { cardTitle: 'Not activated card' },
        isVirtual: false,
        lastFourPAN: '',
        state: 6, // CLOSED
    },
    '21534526': {
        accountID: 1,
        bank: 'Expensify Card',
        cardID: 21534526,
        domainName: 'expensify-policy1.exfy',
        nameValuePairs: { cardTitle: 'Not activated card' },
        isVirtual: false,
        lastFourPAN: '',
        state: 3, // OPEN
    },
};
var domainFeedDataMock = {
    'mockDomain.com': { domainName: 'mockDomain.com', bank: 'Expensify Card', correspondingCardIDs: ['21589168', '21589182'] },
};
var translateMock = jest.fn();
var illustrationsMock = {
    EmptyStateBackgroundImage: jest.fn(),
    ExampleCheckES: jest.fn(),
    ExampleCheckEN: jest.fn(),
    WorkspaceProfile: jest.fn(),
    ExpensifyApprovedLogo: jest.fn(),
    GenericCompanyCard: jest.fn(),
    GenericCompanyCardLarge: jest.fn(),
    GenericCSVCompanyCardLarge: jest.fn(),
};
describe('buildIndividualCardsData', function () {
    it("Builds all individual cards and doesn't generate duplicates", function () {
        var result = (0, CardFeedUtils_1.buildCardsData)(workspaceCardFeeds, cardList, {}, ['21588678'], illustrationsMock);
        expect(result.unselected.length + result.selected.length).toEqual(13);
        // Check if Expensify card was built correctly
        var expensifyCard = result.selected.find(function (card) { return card.keyForList === '21588678'; });
        expect(expensifyCard).toMatchObject({
            lastFourPAN: '1138',
            isSelected: true,
        });
        // Check if company card was built correctly
        var companyCard = result.unselected.find(function (card) { return card.keyForList === '21604933'; });
        expect(companyCard).toMatchObject({
            lastFourPAN: '1601',
            isSelected: false,
        });
    });
    it("Doesn't include physical cards that haven't been issued or haven't been activated", function () {
        var result = (0, CardFeedUtils_1.buildCardsData)(workspaceCardFeedsHiddenOnSearch, cardListHiddenOnSearch, {}, [], illustrationsMock);
        expect(result.unselected.length + result.selected.length).toEqual(0);
    });
});
describe('buildCardsData closed cards', function () {
    it("Builds all closed cards and doesn't generate duplicates", function () {
        var result = (0, CardFeedUtils_1.buildCardsData)(workspaceCardFeedsClosed, cardListClosed, {}, ['21539012'], illustrationsMock, true);
        expect(result.unselected.length + result.selected.length).toEqual(4);
        // Check if Expensify card was built correctly
        var expensifyCard = result.selected.find(function (card) { return card.keyForList === '21539012'; });
        expect(expensifyCard).toMatchObject({
            lastFourPAN: '3211',
            isSelected: true,
        });
        // Check if company card was built correctly
        var companyCard = result.unselected.find(function (card) { return card.keyForList === '21534525'; });
        expect(companyCard).toMatchObject({
            lastFourPAN: '',
            isSelected: false,
        });
    });
});
describe('buildCardsData with empty argument objects', function () {
    it('Returns empty array when cardList and workspaceCardFeeds are empty', function () {
        var result = (0, CardFeedUtils_1.buildCardsData)({}, {}, {}, [], illustrationsMock);
        expect(result).toEqual({ selected: [], unselected: [] });
    });
});
describe('buildCardFeedsData', function () {
    var result = (0, CardFeedUtils_1.buildCardFeedsData)(workspaceCardFeeds, domainFeedDataMock, [], translateMock, illustrationsMock);
    it('Build domain card feed properly', function () {
        // Check if external domain feed was built properly
        expect(result.unselected.at(0)).toMatchObject({
            isCardFeed: true,
            correspondingCards: ['21589168', '21589182'],
        });
        expect(translateMock).toHaveBeenCalledWith('search.filters.card.cardFeedName', { cardFeedBankName: undefined, cardFeedLabel: 'mockDomain.com' });
        // Check if domain card feed was built properly
        expect(result.unselected.at(1)).toMatchObject({
            isCardFeed: true,
            correspondingCards: ['21593492', '21604933', '21638320', '21638598'],
        });
        expect(translateMock).toHaveBeenCalledWith('search.filters.card.cardFeedName', { cardFeedBankName: 'Visa', cardFeedLabel: undefined });
        // Check if workspace card feed that comes from company cards was built properly.
        expect(result.unselected.at(2)).toMatchObject({
            isCardFeed: true,
            correspondingCards: ['21588678', '21588684'],
        });
        expect(translateMock).toHaveBeenCalledWith('search.filters.card.cardFeedName', { cardFeedBankName: undefined, cardFeedLabel: 'test1' });
        // Check if workspace card feed that comes from expensify cards was built properly
        expect(result.unselected.at(3)).toMatchObject({
            isCardFeed: true,
            correspondingCards: ['21589168', '21589182', '21589202', '21638322'],
        });
        expect(translateMock).toHaveBeenCalledWith('search.filters.card.cardFeedName', { cardFeedBankName: undefined, cardFeedLabel: 'test2' });
        // Check if domain card feed was built properly
        expect(result.unselected.length).toEqual(4);
    });
});
describe('buildIndividualCardsData with empty argument objects', function () {
    it('Return empty array when domainCardFeeds and workspaceCardFeeds are empty', function () {
        var result = (0, CardFeedUtils_1.buildCardFeedsData)({}, {}, [], translateMock, illustrationsMock);
        expect(result).toEqual({ selected: [], unselected: [] });
    });
});
