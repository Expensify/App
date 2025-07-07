"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var CardUtils_1 = require("@src/libs/CardUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var shortDate = '0924';
var shortDateSlashed = '09/24';
var shortDateHyphen = '09-24';
var longDate = '092024';
var longDateSlashed = '09/2024';
var longDateHyphen = '09-2024';
var expectedMonth = '09';
var expectedYear = '2024';
var directFeedBanks = [
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT,
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA,
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.BREX,
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CITIBANK,
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.STRIPE,
    CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO,
];
var companyCardsCustomFeedSettings = (_a = {},
    _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = {
        pending: true,
    },
    _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA] = {
        liabilityType: 'personal',
    },
    _a[CONST_1.default.EXPENSIFY_CARD.BANK] = {
        liabilityType: 'personal',
    },
    _a);
var companyCardsCustomFeedSettingsWithNumbers = (_b = {},
    _b["".concat(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, "1")] = {
        pending: true,
    },
    _b["".concat(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA, "1")] = {
        liabilityType: 'personal',
    },
    _b);
var companyCardsCustomVisaFeedSettingsWithNumbers = (_c = {},
    _c["".concat(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA, "1")] = {
        pending: false,
    },
    _c["".concat(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA, "3")] = {
        pending: false,
    },
    _c);
var companyCardsCustomFeedSettingsWithoutExpensifyBank = (_d = {},
    _d[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = {
        pending: true,
    },
    _d[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA] = {
        liabilityType: 'personal',
    },
    _d);
var companyCardsDirectFeedSettings = (_e = {},
    _e[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE] = {
        liabilityType: 'personal',
    },
    _e[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE] = {
        liabilityType: 'personal',
    },
    _e);
var companyCardsSettingsWithoutExpensifyBank = __assign((_f = {}, _f[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = {
    pending: true,
}, _f[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA] = {
    liabilityType: 'personal',
}, _f), companyCardsDirectFeedSettings);
var companyCardsSettingsWithOnePendingFeed = (_g = {},
    _g[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = {
        pending: true,
    },
    _g[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA] = {
        pending: false,
    },
    _g);
var oAuthAccountDetails = (_h = {},
    _h[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE] = {
        accountList: ['CREDIT CARD...6607', 'CREDIT CARD...5501'],
        credentials: 'xxxxx',
        expiration: 1730998958,
    },
    _h[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE] = {
        accountList: ['CREDIT CARD...1233', 'CREDIT CARD...5678', 'CREDIT CARD...4444', 'CREDIT CARD...3333', 'CREDIT CARD...7788'],
        credentials: 'xxxxx',
        expiration: 1730998959,
    },
    _h);
var directFeedCardsSingleList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570652': {
        accountID: 18439984,
        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE,
        cardID: 21570652,
        cardName: 'CREDIT CARD...5501',
        domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
        fraud: 'none',
        lastFourPAN: '5501',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: 200,
        scrapeMinDate: '2024-08-27',
        state: 3,
    },
};
var directFeedCardsMultipleList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570655': {
        accountID: 18439984,
        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
        cardID: 21570655,
        cardName: 'CREDIT CARD...5678',
        domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
        fraud: 'none',
        lastFourPAN: '5678',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: 200,
        scrapeMinDate: '2024-08-27',
        state: 3,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570656': {
        accountID: 18439984,
        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
        cardID: 21570656,
        cardName: 'CREDIT CARD...4444',
        domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
        fraud: 'none',
        lastFourPAN: '5678',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: 403,
        scrapeMinDate: '2024-08-27',
        state: 3,
    },
};
var customFeedCardsList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21310091': {
        accountID: 18439984,
        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA,
        cardID: 21310091,
        cardName: '480801XXXXXX2554',
        domainName: 'expensify-policy41314f4dc5ce25af.exfy',
        fraud: 'none',
        lastFourPAN: '2554',
        lastUpdated: '',
        lastScrape: '2024-11-27 11:00:53',
        scrapeMinDate: '2024-10-17',
        state: 3,
    },
    cardList: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '480801XXXXXX2111': 'ENCRYPTED_CARD_NUMBER',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '480801XXXXXX2554': 'ENCRYPTED_CARD_NUMBER',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '480801XXXXXX2566': 'ENCRYPTED_CARD_NUMBER',
    },
};
var customFeedName = 'Custom feed name';
var policyWithCardsEnabled = {
    areExpensifyCardsEnabled: true,
};
var policyWithCardsDisabled = {
    areExpensifyCardsEnabled: false,
};
var cardSettingsWithPaymentBankAccountID = {
    paymentBankAccountID: '12345',
};
var cardSettingsWithoutPaymentBankAccountID = {
    paymentBankAccountID: undefined,
};
var cardFeedsCollection = {
    // Policy with both custom and direct feeds
    FAKE_ID_1: {
        settings: {
            companyCardNicknames: (_j = {},
                _j[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA] = customFeedName,
                _j),
            companyCards: __assign(__assign({}, companyCardsCustomFeedSettings), companyCardsDirectFeedSettings),
            oAuthAccountDetails: oAuthAccountDetails,
        },
    },
    // Policy with direct feeds only
    FAKE_ID_2: {
        settings: {
            companyCards: companyCardsDirectFeedSettings,
            oAuthAccountDetails: oAuthAccountDetails,
        },
    },
    // Policy with custom feeds only
    FAKE_ID_3: {
        settings: {
            companyCards: companyCardsCustomFeedSettings,
        },
    },
    // Policy with custom feeds only, feed names with numbers
    FAKE_ID_4: {
        settings: {
            companyCards: companyCardsCustomFeedSettingsWithNumbers,
        },
    },
    // Policy with several Visa feeds
    FAKE_ID_5: {
        settings: {
            companyCards: companyCardsCustomVisaFeedSettingsWithNumbers,
        },
    },
    // Policy with one pending feed
    FAKE_ID_6: {
        settings: {
            companyCards: companyCardsSettingsWithOnePendingFeed,
        },
    },
};
/* eslint-disable @typescript-eslint/naming-convention */
var allCardsList = {
    'cards_11111111_oauth.capitalone.com': directFeedCardsMultipleList,
    cards_11111111_vcf1: customFeedCardsList,
    'cards_22222222_oauth.chase.com': directFeedCardsSingleList,
    'cards_11111111_Expensify Card': {
        '21570657': {
            accountID: 18439984,
            bank: CONST_1.default.EXPENSIFY_CARD.BANK,
            cardID: 21570657,
            cardName: 'CREDIT CARD...5644',
            domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
            fraud: 'none',
            lastFourPAN: '',
            lastScrape: '',
            lastUpdated: '',
            state: 2,
        },
    },
};
var mockIllustrations = {
    EmptyStateBackgroundImage: 'EmptyStateBackgroundImage',
    ExampleCheckES: 'ExampleCheckES',
    ExampleCheckEN: 'ExampleCheckEN',
    WorkspaceProfile: 'WorkspaceProfile',
    ExpensifyApprovedLogo: 'ExpensifyApprovedLogo',
    GenericCompanyCard: 'GenericCompanyCard',
    GenericCSVCompanyCardLarge: 'GenericCSVCompanyCardLarge',
    GenericCompanyCardLarge: 'GenericCompanyCardLarge',
};
jest.mock('@src/components/Icon/Illustrations', function () { return require('../../__mocks__/Illustrations'); });
describe('CardUtils', function () {
    describe('Expiration date formatting', function () {
        it('Should format expirationDate month and year to MM/YYYY', function () {
            expect((0, CardUtils_1.getMonthFromExpirationDateString)(longDateSlashed)).toBe(expectedMonth);
            expect((0, CardUtils_1.getYearFromExpirationDateString)(longDateSlashed)).toBe(expectedYear);
        });
        it('Should format expirationDate month and year to MM-YYYY', function () {
            expect((0, CardUtils_1.getMonthFromExpirationDateString)(longDateHyphen)).toBe(expectedMonth);
            expect((0, CardUtils_1.getYearFromExpirationDateString)(longDateHyphen)).toBe(expectedYear);
        });
        it('Should format expirationDate month and year to MMYYYY', function () {
            expect((0, CardUtils_1.getMonthFromExpirationDateString)(longDate)).toBe(expectedMonth);
            expect((0, CardUtils_1.getYearFromExpirationDateString)(longDate)).toBe(expectedYear);
        });
        it('Should format expirationDate month and year to MM/YY', function () {
            expect((0, CardUtils_1.getMonthFromExpirationDateString)(shortDateSlashed)).toBe(expectedMonth);
            expect((0, CardUtils_1.getYearFromExpirationDateString)(shortDateSlashed)).toBe(expectedYear);
        });
        it('Should format expirationDate month and year to MM-YY', function () {
            expect((0, CardUtils_1.getMonthFromExpirationDateString)(shortDateHyphen)).toBe(expectedMonth);
            expect((0, CardUtils_1.getYearFromExpirationDateString)(shortDateHyphen)).toBe(expectedYear);
        });
        it('Should format expirationDate month and year to MMYY', function () {
            expect((0, CardUtils_1.getMonthFromExpirationDateString)(shortDate)).toBe(expectedMonth);
            expect((0, CardUtils_1.getYearFromExpirationDateString)(shortDate)).toBe(expectedYear);
        });
        it('Should format to MM/YYYY given MM/YY', function () {
            expect((0, CardUtils_1.formatCardExpiration)(shortDateSlashed)).toBe(longDateSlashed);
            expect((0, CardUtils_1.formatCardExpiration)(shortDateSlashed)).toBe(longDateSlashed);
        });
        it('Should format to  MM/YYYY given MMYY', function () {
            expect((0, CardUtils_1.formatCardExpiration)(shortDate)).toBe(longDateSlashed);
            expect((0, CardUtils_1.formatCardExpiration)(shortDate)).toBe(longDateSlashed);
        });
    });
    describe('isCustomFeed', function () {
        it('Should return true for the custom visa feed with no number', function () {
            var customFeed = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA;
            var isCustomFeed = (0, CardUtils_1.isCustomFeed)(customFeed);
            expect(isCustomFeed).toBe(true);
        });
        it('Should return true for the custom visa feed with a number', function () {
            var customFeed = "".concat(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA, "1");
            var isCustomFeed = (0, CardUtils_1.isCustomFeed)(customFeed);
            expect(isCustomFeed).toBe(true);
        });
        it('Should return true for the custom mastercard feed with no number', function () {
            var customFeed = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD;
            var isCustomFeed = (0, CardUtils_1.isCustomFeed)(customFeed);
            expect(isCustomFeed).toBe(true);
        });
        it('Should return true for the custom mastercard feed with a number', function () {
            var customFeed = "".concat(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, "3");
            var isCustomFeed = (0, CardUtils_1.isCustomFeed)(customFeed);
            expect(isCustomFeed).toBe(true);
        });
        it('Should return true for the custom amex feed with no number', function () {
            var customFeed = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX;
            var isCustomFeed = (0, CardUtils_1.isCustomFeed)(customFeed);
            expect(isCustomFeed).toBe(true);
        });
        it('Should return true for the custom amex feed with a number', function () {
            var customFeed = "".concat(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX, "2");
            var isCustomFeed = (0, CardUtils_1.isCustomFeed)(customFeed);
            expect(isCustomFeed).toBe(true);
        });
        test.each(directFeedBanks)('Should return false for the direct feed %s', function (directFeed) {
            var isCustomFeed = (0, CardUtils_1.isCustomFeed)(directFeed);
            expect(isCustomFeed).toBe(false);
        });
    });
    describe('getCompanyFeeds', function () {
        it('Should return both custom and direct feeds with filtered out "Expensify Card" bank', function () {
            var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeedsCollection.FAKE_ID_1);
            expect(companyFeeds).toStrictEqual(companyCardsSettingsWithoutExpensifyBank);
        });
        it('Should return direct feeds only since custom feeds are not exist', function () {
            var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeedsCollection.FAKE_ID_2);
            expect(companyFeeds).toStrictEqual(companyCardsDirectFeedSettings);
        });
        it('Should return custom feeds only with filtered out "Expensify Card" bank since direct feeds are not exist', function () {
            var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeedsCollection.FAKE_ID_3);
            expect(companyFeeds).toStrictEqual(companyCardsCustomFeedSettingsWithoutExpensifyBank);
        });
        it('Should return empty object if undefined is passed', function () {
            var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(undefined);
            expect(companyFeeds).toStrictEqual({});
        });
        it('Should return only feeds that are not pending', function () {
            var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeedsCollection.FAKE_ID_6, false, true);
            expect(Object.keys(companyFeeds).length).toStrictEqual(1);
        });
    });
    describe('getSelectedFeed', function () {
        it('Should return last selected custom feed', function () {
            var lastSelectedCustomFeed = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA;
            var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedCustomFeed, cardFeedsCollection.FAKE_ID_1);
            expect(selectedFeed).toBe(lastSelectedCustomFeed);
        });
        it('Should return last selected direct feed', function () {
            var lastSelectedDirectFeed = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE;
            var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedDirectFeed, cardFeedsCollection.FAKE_ID_1);
            expect(selectedFeed).toBe(lastSelectedDirectFeed);
        });
        it('Should return the first available custom feed if lastSelectedFeed is undefined', function () {
            var lastSelectedFeed = undefined;
            var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedFeed, cardFeedsCollection.FAKE_ID_3);
            expect(selectedFeed).toBe(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
        });
        it('Should return the first available direct feed if lastSelectedFeed is undefined', function () {
            var lastSelectedFeed = undefined;
            var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedFeed, cardFeedsCollection.FAKE_ID_2);
            expect(selectedFeed).toBe(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE);
        });
        it('Should return undefined if lastSelectedFeed is undefined and there is no card feeds', function () {
            var lastSelectedFeed = undefined;
            var cardFeeds = undefined;
            var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedFeed, cardFeeds);
            expect(selectedFeed).toBe(undefined);
        });
    });
    describe('getCustomOrFormattedFeedName', function () {
        beforeAll(function () {
            IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
            return (0, waitForBatchedUpdates_1.default)();
        });
        it('Should return custom name if exists', function () {
            var _a, _b;
            var feed = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA;
            var companyCardNicknames = (_b = (_a = cardFeedsCollection.FAKE_ID_1) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.companyCardNicknames;
            var feedName = (0, CardUtils_1.getCustomOrFormattedFeedName)(feed, companyCardNicknames);
            expect(feedName).toBe(customFeedName);
        });
        it('Should return formatted name if there is no custom name', function () {
            var _a, _b;
            var feed = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA;
            var companyCardNicknames = (_b = (_a = cardFeedsCollection.FAKE_ID_3) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.companyCardNicknames;
            var feedName = (0, CardUtils_1.getCustomOrFormattedFeedName)(feed, companyCardNicknames);
            expect(feedName).toBe('Visa cards');
        });
        it('Should return undefined if no feed provided', function () {
            var _a, _b;
            var feed = undefined;
            var companyCardNicknames = (_b = (_a = cardFeedsCollection.FAKE_ID_1) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.companyCardNicknames;
            var feedName = (0, CardUtils_1.getCustomOrFormattedFeedName)(feed, companyCardNicknames);
            expect(feedName).toBe(undefined);
        });
    });
    describe('lastFourNumbersFromCardName', function () {
        it('Should return last 4 numbers from the card name', function () {
            var lastFour = (0, CardUtils_1.lastFourNumbersFromCardName)('Business Card Cash - 3001');
            expect(lastFour).toBe('3001');
        });
        it('Should return empty string if card number does not have space', function () {
            var lastFour = (0, CardUtils_1.lastFourNumbersFromCardName)('480801XXXXXX2554');
            expect(lastFour).toBe('');
        });
        it('Should return empty string if card number does not have number in the end with dash', function () {
            var lastFour = (0, CardUtils_1.lastFourNumbersFromCardName)('Business Card Cash - Business');
            expect(lastFour).toBe('');
        });
    });
    describe('maskCardNumber', function () {
        it("Should return the card number divided into chunks of 4, with 'X' replaced by '•' if it's provided in the '480801XXXXXX2554' format", function () {
            var cardNumber = '480801XXXXXX2554';
            var maskedCardNumber = (0, CardUtils_1.maskCardNumber)(cardNumber, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
            expect(maskedCardNumber).toBe('4808 01•• •••• 2554');
        });
        it('Should return card number without changes if it has empty space', function () {
            var cardNumber = 'CREDIT CARD...6607';
            var maskedCardNumber = (0, CardUtils_1.maskCardNumber)(cardNumber, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE);
            expect(maskedCardNumber).toBe(cardNumber);
        });
        it("Should return the Amex direct feed card number divided into 4/6/5 chunks, with 'X' replaced by '•' if it's provided in '211944XXXXX6557' format", function () {
            var cardNumber = '211944XXXXX6557';
            var maskedCardNumber = (0, CardUtils_1.maskCardNumber)(cardNumber, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT);
            expect(maskedCardNumber).toBe('2119 44•••• •6557');
        });
        it("Should return the Amex custom feed card number divided into 4/6/5 chunks, with 'X' replaced by '•' if it's provided in '211944XXXXX6557' format", function () {
            var cardNumber = '211944XXXXX6557';
            var maskedCardNumber = (0, CardUtils_1.maskCardNumber)(cardNumber, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX);
            expect(maskedCardNumber).toBe('2119 44•••• •6557');
        });
        it('Should return masked card number even if undefined feed was provided', function () {
            var cardNumber = '480801XXXXXX2554';
            var maskedCardNumber = (0, CardUtils_1.maskCardNumber)(cardNumber, undefined);
            expect(maskedCardNumber).toBe('4808 01•• •••• 2554');
        });
        it('Should return empty string if invalid card name was provided', function () {
            var maskedCardNumber = (0, CardUtils_1.maskCardNumber)('', CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
            expect(maskedCardNumber).toBe('');
        });
        it('Should return card name without last 4 numbers', function () {
            var maskedCardNumber = (0, CardUtils_1.maskCardNumber)('Business Card Cash - 3001', undefined);
            expect(maskedCardNumber).toBe('Business Card Cash');
        });
    });
    describe('getCardFeedName', function () {
        it('Should return a valid name if a valid feed was provided', function () {
            var feed = 'vcf';
            var feedName = (0, CardUtils_1.getBankName)(feed);
            expect(feedName).toBe('Visa');
        });
        it('Should return a valid name if an OldDot feed variation was provided', function () {
            var feed = 'oauth.americanexpressfdx.com 2003';
            var feedName = (0, CardUtils_1.getBankName)(feed);
            expect(feedName).toBe('American Express');
        });
        it('Should return a valid name if a CSV imported feed variation was provided', function () {
            var feed = 'cards_2267989_ccupload666';
            var feedName = (0, CardUtils_1.getBankName)(feed);
            expect(feedName).toBe('CSV');
        });
        it('Should return empty string if invalid feed was provided', function () {
            var feed = 'vvcf';
            var feedName = (0, CardUtils_1.getBankName)(feed);
            expect(feedName).toBe('');
        });
    });
    describe('getCardFeedIcon', function () {
        it('Should return a valid illustration if a valid feed was provided', function () {
            var feed = 'vcf';
            var illustration = (0, CardUtils_1.getCardFeedIcon)(feed, mockIllustrations);
            expect(illustration).toBe('VisaCompanyCardDetailLarge');
        });
        it('Should return a valid illustration if an OldDot feed variation was provided', function () {
            var feed = 'oauth.americanexpressfdx.com 2003';
            var illustration = (0, CardUtils_1.getCardFeedIcon)(feed, mockIllustrations);
            expect(illustration).toBe('AmexCardCompanyCardDetailLarge');
        });
        it('Should return a valid illustration if a CSV imported feed variation was provided', function () {
            var feed = 'cards_2267989_ccupload666';
            var illustration = (0, CardUtils_1.getCardFeedIcon)(feed, mockIllustrations);
            expect(illustration).toBe('GenericCSVCompanyCardLarge');
        });
        it('Should return valid illustration if a non-matching feed was provided', function () {
            var feed = '666';
            var illustration = (0, CardUtils_1.getCardFeedIcon)(feed, mockIllustrations);
            expect(illustration).toBe('GenericCompanyCardLarge');
        });
    });
    describe('getBankCardDetailsImage', function () {
        it('Should return a valid illustration if a valid bank name was provided', function () {
            var bank = 'American Express';
            var illustration = (0, CardUtils_1.getBankCardDetailsImage)(bank, mockIllustrations);
            expect(illustration).toBe('AmexCardCompanyCardDetail');
        });
        it('Should return a valid illustration if Other bank name was provided', function () {
            var bank = 'Other';
            var illustration = (0, CardUtils_1.getBankCardDetailsImage)(bank, mockIllustrations);
            expect(illustration).toBe('GenericCompanyCard');
        });
    });
    describe('getFilteredCardList', function () {
        it('Should return filtered custom feed cards list', function () {
            var cardsList = (0, CardUtils_1.getFilteredCardList)(customFeedCardsList, undefined);
            expect(cardsList).toStrictEqual({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '480801XXXXXX2111': 'ENCRYPTED_CARD_NUMBER',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '480801XXXXXX2566': 'ENCRYPTED_CARD_NUMBER',
            });
        });
        it('Should return filtered direct feed cards list with a single card', function () {
            var cardsList = (0, CardUtils_1.getFilteredCardList)(directFeedCardsSingleList, oAuthAccountDetails[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE]);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(cardsList).toStrictEqual({ 'CREDIT CARD...6607': 'CREDIT CARD...6607' });
        });
        it('Should return filtered direct feed cards list with multiple cards', function () {
            var cardsList = (0, CardUtils_1.getFilteredCardList)(directFeedCardsMultipleList, oAuthAccountDetails[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]);
            expect(cardsList).toStrictEqual({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'CREDIT CARD...1233': 'CREDIT CARD...1233',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'CREDIT CARD...3333': 'CREDIT CARD...3333',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'CREDIT CARD...7788': 'CREDIT CARD...7788',
            });
        });
        it('Should return empty object if no data was provided', function () {
            var cardsList = (0, CardUtils_1.getFilteredCardList)(undefined, undefined);
            expect(cardsList).toStrictEqual({});
        });
        it('Should handle the case when all cards are already assigned in other workspaces', function () {
            var _a;
            var assignedCard1 = 'CREDIT CARD...5566';
            var assignedCard2 = 'CREDIT CARD...6677';
            var mockAllWorkspaceCards = {
                cards_888888_feed: {
                    '11111': {
                        accountID: 999999,
                        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                        cardID: 11111,
                        cardName: assignedCard1,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                    '22222': {
                        accountID: 999999,
                        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                        cardID: 22222,
                        cardName: assignedCard2,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                },
            };
            var customFeedWithAllAssignedCards = {
                cardList: (_a = {},
                    _a[assignedCard1] = 'ENCRYPTED_DATA',
                    _a[assignedCard2] = 'ENCRYPTED_DATA',
                    _a),
            };
            var filteredCards = (0, CardUtils_1.getFilteredCardList)(customFeedWithAllAssignedCards, undefined, mockAllWorkspaceCards);
            expect(filteredCards).toStrictEqual({});
        });
        it('Should filter out cards that are already assigned in another workspace (custom feed)', function () {
            var customFeedWorkspaceCardsList = {
                '21310091': {
                    accountID: 18439984,
                    bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardID: 21310091,
                    cardName: '480801XXXXXX2554',
                    domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                    fraud: 'none',
                    lastFourPAN: '2554',
                    lastUpdated: '',
                    lastScrape: '2024-11-27 11:00:53',
                    scrapeMinDate: '2024-10-17',
                    state: 3,
                },
                '21310092': {
                    accountID: 18439985,
                    bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardID: 21310092,
                    cardName: '480801XXXXXX2666',
                    domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                    fraud: 'none',
                    lastFourPAN: '2666',
                    lastUpdated: '',
                    lastScrape: '2024-11-27 11:00:53',
                    scrapeMinDate: '2024-10-17',
                    state: 3,
                },
                cardList: {
                    '480801XXXXXX2554': 'ENCRYPTED_CARD_NUMBER',
                    '480801XXXXXX2666': 'ENCRYPTED_CARD_NUMBER',
                },
            };
            var filteredCards = (0, CardUtils_1.getFilteredCardList)(customFeedWorkspaceCardsList, undefined);
            expect(filteredCards).toStrictEqual({});
        });
        it('Should filter out cards that are already assigned in another workspace (direct feed)', function () {
            var _a;
            var assignedCard1 = 'CREDIT CARD...3344';
            var assignedCard2 = 'CREDIT CARD...3355';
            var unassignedCard = 'CREDIT CARD...6666';
            var mockAllWorkspaceCards = {
                cards_888888_feed: {
                    '67889': {
                        accountID: 999998,
                        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
                        cardID: 67889,
                        cardName: assignedCard1,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                    '67890': {
                        accountID: 999999,
                        bank: CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
                        cardID: 67890,
                        cardName: assignedCard2,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                },
            };
            var directFeedWithAssignedCard = {
                accountList: [assignedCard1, assignedCard2, unassignedCard],
            };
            var filteredCards = (0, CardUtils_1.getFilteredCardList)(undefined, directFeedWithAssignedCard, mockAllWorkspaceCards);
            expect(filteredCards).toStrictEqual((_a = {}, _a["".concat(unassignedCard)] = unassignedCard, _a));
        });
    });
    describe('getFeedType', function () {
        it('should return the feed name with a consecutive number, if there is already a feed with a number', function () {
            var feedType = (0, CardUtils_1.getFeedType)('vcf', cardFeedsCollection.FAKE_ID_4);
            expect(feedType).toBe('vcf2');
        });
        it('should return the feed name with 1, if there is already a feed without a number', function () {
            var feedType = (0, CardUtils_1.getFeedType)('vcf', cardFeedsCollection.FAKE_ID_3);
            expect(feedType).toBe('vcf1');
        });
        it('should return the feed name with with the first smallest available number', function () {
            var feedType = (0, CardUtils_1.getFeedType)('vcf', cardFeedsCollection.FAKE_ID_5);
            expect(feedType).toBe('vcf2');
        });
    });
    describe('flatAllCardsList', function () {
        it('should return the flattened list of non-Expensify cards related to the provided workspaceAccountID', function () {
            var workspaceAccountID = 11111111;
            var flattenedCardsList = (0, CardUtils_1.flatAllCardsList)(allCardsList, workspaceAccountID);
            var cardList = customFeedCardsList.cardList, customCards = __rest(customFeedCardsList, ["cardList"]);
            expect(flattenedCardsList).toStrictEqual(__assign(__assign({}, directFeedCardsMultipleList), customCards));
        });
        it('should return undefined if not defined cards list was provided', function () {
            var workspaceAccountID = 11111111;
            var flattenedCardsList = (0, CardUtils_1.flatAllCardsList)(undefined, workspaceAccountID);
            expect(flattenedCardsList).toBeUndefined();
        });
    });
    describe('checkIfFeedConnectionIsBroken', function () {
        it('should return true if at least one of the feed(s) cards has the lastScrapeResult not equal to 200', function () {
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)(directFeedCardsMultipleList)).toBeTruthy();
        });
        it('should return false if all of the feed(s) cards has the lastScrapeResult equal to 200', function () {
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)(directFeedCardsSingleList)).toBeFalsy();
        });
        it('should return false if no feed(s) cards are provided', function () {
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)({})).toBeFalsy();
        });
        it('should not take into consideration cards related to feed which is provided as feedToExclude', function () {
            var cards = __assign(__assign({}, directFeedCardsMultipleList), directFeedCardsSingleList);
            var feedToExclude = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE;
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)(cards, feedToExclude)).toBeFalsy();
        });
    });
    describe('checkIfFeedConnectionIsBroken', function () {
        it('should return true if at least one of the feed(s) cards has the lastScrapeResult not equal to 200', function () {
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)(directFeedCardsMultipleList)).toBeTruthy();
        });
        it('should return false if all of the feed(s) cards has the lastScrapeResult equal to 200', function () {
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)(directFeedCardsSingleList)).toBeFalsy();
        });
        it('should return false if no feed(s) cards are provided', function () {
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)({})).toBeFalsy();
        });
        it('should not take into consideration cards related to feed which is provided as feedToExclude', function () {
            var cards = __assign(__assign({}, directFeedCardsMultipleList), directFeedCardsSingleList);
            var feedToExclude = CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE;
            expect((0, CardUtils_1.checkIfFeedConnectionIsBroken)(cards, feedToExclude)).toBeFalsy();
        });
    });
    describe('hasIssuedExpensifyCard', function () {
        it('should return true when Expensify Card was issued for given workspace', function () {
            var workspaceAccountID = 11111111;
            expect((0, CardUtils_1.hasIssuedExpensifyCard)(workspaceAccountID, allCardsList)).toBe(true);
        });
        it('should return false when Expensify Card was not issued for given workspace', function () {
            var workspaceAccountID = 11111111;
            expect((0, CardUtils_1.hasIssuedExpensifyCard)(workspaceAccountID, {})).toBe(false);
        });
    });
    describe('isExpensifyCardFullySetUp', function () {
        it('should return true when policy has enabled cards and cardSettings has payment bank account ID', function () {
            var result = (0, CardUtils_1.isExpensifyCardFullySetUp)(policyWithCardsEnabled, cardSettingsWithPaymentBankAccountID);
            expect(result).toBe(true);
        });
        it('should return false when policy has disabled cards', function () {
            var result = (0, CardUtils_1.isExpensifyCardFullySetUp)(policyWithCardsDisabled, cardSettingsWithoutPaymentBankAccountID);
            expect(result).toBe(false);
        });
        it('should return false when cardSettings has no payment bank account ID', function () {
            var result = (0, CardUtils_1.isExpensifyCardFullySetUp)(policyWithCardsEnabled, cardSettingsWithoutPaymentBankAccountID);
            expect(result).toBe(false);
        });
        it('should return false when cardSettings is undefined', function () {
            var result = (0, CardUtils_1.isExpensifyCardFullySetUp)(policyWithCardsEnabled, undefined);
            expect(result).toBe(false);
        });
        it('should return false when both policy and cardSettings are undefined', function () {
            var result = (0, CardUtils_1.isExpensifyCardFullySetUp)(undefined, undefined);
            expect(result).toBe(false);
        });
    });
    describe('filterInactiveCards', function () {
        it('should filter out closed, deactivated and suspended cards', function () {
            var activeCards = { card1: { cardID: 1, state: CONST_1.default.EXPENSIFY_CARD.STATE.OPEN } };
            var closedCards = {
                card2: { cardID: 2, state: CONST_1.default.EXPENSIFY_CARD.STATE.CLOSED },
                card3: { cardID: 3, state: CONST_1.default.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED },
                card4: { cardID: 4, state: CONST_1.default.EXPENSIFY_CARD.STATE.STATE_SUSPENDED },
            };
            var cardList = __assign(__assign({}, activeCards), closedCards);
            var filteredList = (0, CardUtils_1.filterInactiveCards)(cardList);
            expect(filteredList).toEqual(activeCards);
        });
        it('should return an empty object if undefined card list is passed', function () {
            var cards = (0, CardUtils_1.filterInactiveCards)(undefined);
            expect(cards).toEqual({});
        });
    });
    describe('sortCardsByCardholderName', function () {
        var mockPersonalDetails = {
            1: {
                accountID: 1,
                login: 'john@example.com',
                displayName: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
            },
            2: {
                accountID: 2,
                login: 'jane@example.com',
                displayName: 'Jane Smith',
                firstName: 'Jane',
                lastName: 'Smith',
            },
            3: {
                accountID: 3,
                login: 'unknown@example.com',
                // No displayName or firstName/lastName
            },
        };
        var mockCards = {
            '1': {
                cardID: 1,
                accountID: 1,
                cardName: 'Card 1',
                bank: 'expensify',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            },
            '2': {
                cardID: 2,
                accountID: 2,
                bank: 'expensify',
                cardName: 'Card 2',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            },
            '3': {
                cardID: 3,
                accountID: 3,
                bank: 'expensify',
                cardName: 'Card 3',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            },
        };
        it('should sort cards by cardholder name in ascending order', function () {
            var _a, _b, _c;
            var policyMembersAccountIDs = [1, 2, 3];
            var cards = (0, CardUtils_1.getCardsByCardholderName)(mockCards, policyMembersAccountIDs);
            var sortedCards = (0, CardUtils_1.sortCardsByCardholderName)(cards, mockPersonalDetails);
            expect(sortedCards).toHaveLength(3);
            expect((_a = sortedCards.at(0)) === null || _a === void 0 ? void 0 : _a.cardID).toBe(2);
            expect((_b = sortedCards.at(1)) === null || _b === void 0 ? void 0 : _b.cardID).toBe(1);
            expect((_c = sortedCards.at(2)) === null || _c === void 0 ? void 0 : _c.cardID).toBe(3);
        });
        it('should filter out cards that are not associated with policy members', function () {
            var _a, _b;
            var policyMembersAccountIDs = [1, 2]; // Exclude accountID 3
            var cards = (0, CardUtils_1.getCardsByCardholderName)(mockCards, policyMembersAccountIDs);
            var sortedCards = (0, CardUtils_1.sortCardsByCardholderName)(cards, mockPersonalDetails);
            expect(sortedCards).toHaveLength(2);
            expect((_a = sortedCards.at(0)) === null || _a === void 0 ? void 0 : _a.cardID).toBe(2);
            expect((_b = sortedCards.at(1)) === null || _b === void 0 ? void 0 : _b.cardID).toBe(1);
        });
        it('should handle undefined cardsList', function () {
            var policyMembersAccountIDs = [1, 2, 3];
            var cards = (0, CardUtils_1.getCardsByCardholderName)(undefined, policyMembersAccountIDs);
            var sortedCards = (0, CardUtils_1.sortCardsByCardholderName)(cards, mockPersonalDetails);
            expect(sortedCards).toHaveLength(0);
        });
        it('should handle undefined personalDetails', function () {
            var _a, _b, _c;
            var policyMembersAccountIDs = [1, 2, 3];
            var cards = (0, CardUtils_1.getCardsByCardholderName)(mockCards, policyMembersAccountIDs);
            var sortedCards = (0, CardUtils_1.sortCardsByCardholderName)(cards, undefined);
            expect(sortedCards).toHaveLength(3);
            // All cards should be sorted with default names
            expect((_a = sortedCards.at(0)) === null || _a === void 0 ? void 0 : _a.cardID).toBe(1);
            expect((_b = sortedCards.at(1)) === null || _b === void 0 ? void 0 : _b.cardID).toBe(2);
            expect((_c = sortedCards.at(2)) === null || _c === void 0 ? void 0 : _c.cardID).toBe(3);
        });
        it('should handle cards with missing accountID', function () {
            var _a;
            var cardsWithMissingAccountID = {
                '1': {
                    cardID: 1,
                    accountID: 1,
                    cardName: 'Card 1',
                    bank: 'expensify',
                    domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 2,
                },
                '2': {
                    cardID: 2,
                    cardName: 'Card 2',
                    bank: 'expensify',
                    domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 2,
                },
            };
            var policyMembersAccountIDs = [1, 2];
            var cards = (0, CardUtils_1.getCardsByCardholderName)(cardsWithMissingAccountID, policyMembersAccountIDs);
            var sortedCards = (0, CardUtils_1.sortCardsByCardholderName)(cards, mockPersonalDetails);
            expect(sortedCards).toHaveLength(1);
            expect((_a = sortedCards.at(0)) === null || _a === void 0 ? void 0 : _a.cardID).toBe(1);
        });
    });
});
