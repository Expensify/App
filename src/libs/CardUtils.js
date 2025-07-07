"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorrectStepForSelectedBank = exports.getBankCardDetailsImage = void 0;
exports.isExpensifyCard = isExpensifyCard;
exports.getDomainCards = getDomainCards;
exports.formatCardExpiration = formatCardExpiration;
exports.getMonthFromExpirationDateString = getMonthFromExpirationDateString;
exports.getYearFromExpirationDateString = getYearFromExpirationDateString;
exports.maskCard = maskCard;
exports.maskCardNumber = maskCardNumber;
exports.getCardDescription = getCardDescription;
exports.getMCardNumberString = getMCardNumberString;
exports.getTranslationKeyForLimitType = getTranslationKeyForLimitType;
exports.getEligibleBankAccountsForCard = getEligibleBankAccountsForCard;
exports.sortCardsByCardholderName = sortCardsByCardholderName;
exports.getCardFeedIcon = getCardFeedIcon;
exports.getBankName = getBankName;
exports.isSelectedFeedExpired = isSelectedFeedExpired;
exports.getCompanyFeeds = getCompanyFeeds;
exports.isCustomFeed = isCustomFeed;
exports.getSelectedFeed = getSelectedFeed;
exports.getPlaidCountry = getPlaidCountry;
exports.getCustomOrFormattedFeedName = getCustomOrFormattedFeedName;
exports.isCardClosed = isCardClosed;
exports.isPlaidSupportedCountry = isPlaidSupportedCountry;
exports.getFilteredCardList = getFilteredCardList;
exports.hasOnlyOneCardToAssign = hasOnlyOneCardToAssign;
exports.checkIfNewFeedConnected = checkIfNewFeedConnected;
exports.getDefaultCardName = getDefaultCardName;
exports.getDomainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID;
exports.mergeCardListWithWorkspaceFeeds = mergeCardListWithWorkspaceFeeds;
exports.isCard = isCard;
exports.getAllCardsForWorkspace = getAllCardsForWorkspace;
exports.isCardHiddenFromSearch = isCardHiddenFromSearch;
exports.getFeedType = getFeedType;
exports.flatAllCardsList = flatAllCardsList;
exports.checkIfFeedConnectionIsBroken = checkIfFeedConnectionIsBroken;
exports.isSmartLimitEnabled = isSmartLimitEnabled;
exports.lastFourNumbersFromCardName = lastFourNumbersFromCardName;
exports.hasIssuedExpensifyCard = hasIssuedExpensifyCard;
exports.hasCardListObject = hasCardListObject;
exports.isExpensifyCardFullySetUp = isExpensifyCardFullySetUp;
exports.filterInactiveCards = filterInactiveCards;
exports.getFundIdFromSettingsKey = getFundIdFromSettingsKey;
exports.getCardsByCardholderName = getCardsByCardholderName;
exports.filterCardsByPersonalDetails = filterCardsByPersonalDetails;
exports.getCompanyCardDescription = getCompanyCardDescription;
exports.getPlaidInstitutionIconUrl = getPlaidInstitutionIconUrl;
exports.getPlaidInstitutionId = getPlaidInstitutionId;
exports.getCorrectStepForPlaidSelectedBank = getCorrectStepForPlaidSelectedBank;
exports.getCustomCardName = getCustomCardName;
var date_fns_1 = require("date-fns");
var groupBy_1 = require("lodash/groupBy");
var react_native_onyx_1 = require("react-native-onyx");
var expensify_card_svg_1 = require("@assets/images/expensify-card.svg");
var Illustrations = require("@src/components/Icon/Illustrations");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var LocaleCompare_1 = require("./LocaleCompare");
var Localize_1 = require("./Localize");
var ObjectUtils_1 = require("./ObjectUtils");
var PersonalDetailsUtils_1 = require("./PersonalDetailsUtils");
var StringUtils_1 = require("./StringUtils");
var allCards = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CARD_LIST,
    callback: function (val) {
        if (!val || Object.keys(val).length === 0) {
            return;
        }
        allCards = val;
    },
});
var allWorkspaceCards = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST,
    waitForCollectionCallback: true,
    callback: function (value) {
        allWorkspaceCards = value;
    },
});
var customCardNames = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES,
    callback: function (value) {
        customCardNames = value;
    },
});
/**
 * @returns string with a month in MM format
 */
function getMonthFromExpirationDateString(expirationDateString) {
    return expirationDateString.substring(0, 2);
}
/**
 * @param cardID
 * @returns boolean
 */
function isExpensifyCard(cardID) {
    if (!cardID) {
        return false;
    }
    var card = allCards[cardID];
    if (!card) {
        return false;
    }
    return card.bank === CONST_1.default.EXPENSIFY_CARD.BANK;
}
/**
 * @param cardID
 * @returns string in format %<bank> - <lastFourPAN || Not Activated>%.
 */
function getCardDescription(cardID, cards) {
    if (cards === void 0) { cards = allCards; }
    if (!cardID) {
        return '';
    }
    var card = cards[cardID];
    if (!card) {
        return '';
    }
    var isPlaid = !!getPlaidInstitutionId(card.bank);
    var bankName = isPlaid ? card === null || card === void 0 ? void 0 : card.cardName : getBankName(card.bank);
    var cardDescriptor = card.state === CONST_1.default.EXPENSIFY_CARD.STATE.NOT_ACTIVATED ? (0, Localize_1.translateLocal)('cardTransactions.notActivated') : card.lastFourPAN;
    var humanReadableBankName = card.bank === CONST_1.default.EXPENSIFY_CARD.BANK ? CONST_1.default.EXPENSIFY_CARD.BANK : bankName;
    return cardDescriptor && !isPlaid ? "".concat(humanReadableBankName, " - ").concat(cardDescriptor) : "".concat(humanReadableBankName);
}
/**
 * @param transactionCardName
 * @param cardID
 * @param cards
 * @returns company card name
 */
function getCompanyCardDescription(transactionCardName, cardID, cards) {
    if (!cardID || isExpensifyCard(cardID) || !(cards === null || cards === void 0 ? void 0 : cards[cardID])) {
        return transactionCardName;
    }
    var card = cards[cardID];
    return card.cardName;
}
function isCard(item) {
    return typeof item === 'object' && 'cardID' in item && !!item.cardID && 'bank' in item && !!item.bank;
}
function isCardHiddenFromSearch(card) {
    var _a, _b;
    return !((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.isVirtual) && CONST_1.default.EXPENSIFY_CARD.HIDDEN_FROM_SEARCH_STATES.includes((_b = card.state) !== null && _b !== void 0 ? _b : 0);
}
function isCardClosed(card) {
    return (card === null || card === void 0 ? void 0 : card.state) === CONST_1.default.EXPENSIFY_CARD.STATE.CLOSED;
}
function mergeCardListWithWorkspaceFeeds(workspaceFeeds, cardList, shouldExcludeCardHiddenFromSearch) {
    if (cardList === void 0) { cardList = allCards; }
    if (shouldExcludeCardHiddenFromSearch === void 0) { shouldExcludeCardHiddenFromSearch = false; }
    var feedCards = {};
    Object.values(cardList).forEach(function (card) {
        if (!isCard(card) || (shouldExcludeCardHiddenFromSearch && isCardHiddenFromSearch(card))) {
            return;
        }
        feedCards[card.cardID] = card;
    });
    Object.values(workspaceFeeds !== null && workspaceFeeds !== void 0 ? workspaceFeeds : {}).forEach(function (currentCardFeed) {
        Object.values(currentCardFeed !== null && currentCardFeed !== void 0 ? currentCardFeed : {}).forEach(function (card) {
            if (!isCard(card) || (shouldExcludeCardHiddenFromSearch && isCardHiddenFromSearch(card))) {
                return;
            }
            feedCards[card.cardID] = card;
        });
    });
    return feedCards;
}
/**
 * @returns string with a year in YY or YYYY format
 */
function getYearFromExpirationDateString(expirationDateString) {
    var stringContainsNumbersOnly = /^\d+$/.test(expirationDateString);
    var cardYear = stringContainsNumbersOnly ? expirationDateString.substring(2) : expirationDateString.substring(3);
    return cardYear.length === 2 ? "20".concat(cardYear) : cardYear;
}
/**
 * @returns string with a month in MM/YYYY format
 */
function formatCardExpiration(expirationDateString) {
    // already matches MM/YYYY format
    var dateFormat = /^\d{2}\/\d{4}$/;
    if (dateFormat.test(expirationDateString)) {
        return expirationDateString;
    }
    var expirationMonth = getMonthFromExpirationDateString(expirationDateString);
    var expirationYear = getYearFromExpirationDateString(expirationDateString);
    return "".concat(expirationMonth, "/").concat(expirationYear);
}
/**
 * @param cardList - collection of assigned cards
 * @returns collection of assigned cards grouped by domain
 */
function getDomainCards(cardList) {
    // Check for domainName to filter out personal credit cards.
    var activeCards = Object.values(cardList !== null && cardList !== void 0 ? cardList : {}).filter(function (card) { return !!(card === null || card === void 0 ? void 0 : card.domainName) && CONST_1.default.EXPENSIFY_CARD.ACTIVE_STATES.some(function (element) { return element === card.state; }); });
    return (0, groupBy_1.default)(activeCards, function (card) { return card.domainName; });
}
/**
 * Returns a masked credit card string with spaces for every four symbols.
 * If the last four digits are provided, all preceding digits will be masked.
 * If not, the entire card string will be masked.
 *
 * @param [lastFour=""] - The last four digits of the card (optional).
 * @returns - The masked card string.
 */
function maskCard(lastFour) {
    if (lastFour === void 0) { lastFour = ''; }
    var totalDigits = 16;
    var maskedLength = totalDigits - lastFour.length;
    // Create a string with '•' repeated for the masked portion
    var maskedString = '•'.repeat(maskedLength) + lastFour;
    // Insert space for every four symbols
    return maskedString.replace(/(.{4})/g, '$1 ').trim();
}
/**
 * Returns a masked credit card string.
 * Converts given 'X' to '•' for the entire card string.
 *
 * @param cardName - card name with XXXX in the middle.
 * @param feed - card feed.
 * @param showOriginalName - show original card name instead of masked.
 * @returns - The masked card string.
 */
function maskCardNumber(cardName, feed, showOriginalName) {
    if (!cardName || cardName === '') {
        return '';
    }
    var hasSpace = /\s/.test(cardName);
    var maskedString = cardName.replace(/X/g, '•');
    var isAmexBank = [CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT].some(function (value) { return value === feed; });
    if (hasSpace) {
        if (showOriginalName) {
            return cardName;
        }
        return cardName.replace(/ - \d{4}$/, '');
    }
    if (isAmexBank && maskedString.length === 15) {
        return maskedString.replace(/(.{4})(.{6})(.{5})/, '$1 $2 $3');
    }
    return maskedString.replace(/(.{4})/g, '$1 ').trim();
}
/**
 * Returns last 4 number from company card name
 *
 * @param cardName - card name with dash in the middle and 4 numbers in the end.
 * @returns - Last 4 numbers
 */
function lastFourNumbersFromCardName(cardName) {
    var name = cardName !== null && cardName !== void 0 ? cardName : '';
    var hasSpace = /\s/.test(name);
    var match = name.match(/(\d{4})$/);
    if (!cardName || cardName === '' || !hasSpace || !match) {
        return '';
    }
    return match[1];
}
function getMCardNumberString(cardNumber) {
    return cardNumber.replace(/\s/g, '');
}
function getTranslationKeyForLimitType(limitType) {
    switch (limitType) {
        case CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
            return 'workspace.card.issueNewCard.smartLimit';
        case CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
            return 'workspace.card.issueNewCard.fixedAmount';
        case CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
            return 'workspace.card.issueNewCard.monthly';
        default:
            return '';
    }
}
function getEligibleBankAccountsForCard(bankAccountsList) {
    if (!bankAccountsList || (0, EmptyObject_1.isEmptyObject)(bankAccountsList)) {
        return [];
    }
    return Object.values(bankAccountsList).filter(function (bankAccount) { var _a, _b; return ((_a = bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.accountData) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.BANK_ACCOUNT.TYPE.BUSINESS && ((_b = bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.accountData) === null || _b === void 0 ? void 0 : _b.allowDebit); });
}
function getCardsByCardholderName(cardsList, policyMembersAccountIDs) {
    var _a = cardsList !== null && cardsList !== void 0 ? cardsList : {}, cardList = _a.cardList, cards = __rest(_a, ["cardList"]);
    return Object.values(cards).filter(function (card) { return card.accountID && policyMembersAccountIDs.includes(card.accountID); });
}
function sortCardsByCardholderName(cards, personalDetails) {
    return cards.sort(function (cardA, cardB) {
        var _a, _b;
        var userA = cardA.accountID ? ((_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[cardA.accountID]) !== null && _a !== void 0 ? _a : {}) : {};
        var userB = cardB.accountID ? ((_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[cardB.accountID]) !== null && _b !== void 0 ? _b : {}) : {};
        var aName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(userA);
        var bName = (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(userB);
        return (0, LocaleCompare_1.default)(aName, bName);
    });
}
function filterCardsByPersonalDetails(card, searchQuery, personalDetails) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var normalizedSearchQuery = StringUtils_1.default.normalize(searchQuery.toLowerCase());
    var cardTitle = StringUtils_1.default.normalize((_c = (_b = (_a = card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.cardTitle) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '');
    var lastFourPAN = StringUtils_1.default.normalize((_e = (_d = card === null || card === void 0 ? void 0 : card.lastFourPAN) === null || _d === void 0 ? void 0 : _d.toLowerCase()) !== null && _e !== void 0 ? _e : '');
    var accountLogin = StringUtils_1.default.normalize((_j = (_h = (_g = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_f = card.accountID) !== null && _f !== void 0 ? _f : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _g === void 0 ? void 0 : _g.login) === null || _h === void 0 ? void 0 : _h.toLowerCase()) !== null && _j !== void 0 ? _j : '');
    var accountName = StringUtils_1.default.normalize((_o = (_m = (_l = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_k = card.accountID) !== null && _k !== void 0 ? _k : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _l === void 0 ? void 0 : _l.displayName) === null || _m === void 0 ? void 0 : _m.toLowerCase()) !== null && _o !== void 0 ? _o : '');
    return (cardTitle.includes(normalizedSearchQuery) ||
        lastFourPAN.includes(normalizedSearchQuery) ||
        accountLogin.includes(normalizedSearchQuery) ||
        accountName.includes(normalizedSearchQuery));
}
function getCardFeedIcon(cardFeed, illustrations) {
    var _a;
    var feedIcons = (_a = {},
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA] = Illustrations.VisaCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX] = Illustrations.AmexCardCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = Illustrations.MasterCardCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT] = Illustrations.AmexCardCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA] = Illustrations.BankOfAmericaCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE] = Illustrations.CapitalOneCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE] = Illustrations.ChaseCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CITIBANK] = Illustrations.CitibankCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO] = Illustrations.WellsFargoCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.BREX] = Illustrations.BrexCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.STRIPE] = Illustrations.StripeCompanyCardDetailLarge,
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CSV] = illustrations.GenericCSVCompanyCardLarge,
        _a[CONST_1.default.EXPENSIFY_CARD.BANK] = expensify_card_svg_1.default,
        _a);
    if (cardFeed.startsWith(CONST_1.default.EXPENSIFY_CARD.BANK)) {
        return expensify_card_svg_1.default;
    }
    if (feedIcons[cardFeed]) {
        return feedIcons[cardFeed];
    }
    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, cdfbmo
    var feedKey = Object.keys(feedIcons).find(function (feed) { return cardFeed.startsWith(feed); });
    if (feedKey) {
        return feedIcons[feedKey];
    }
    if (cardFeed.includes(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CSV)) {
        return illustrations.GenericCSVCompanyCardLarge;
    }
    return illustrations.GenericCompanyCardLarge;
}
/**
 * Verify if the feed is a custom feed. Those are also referred to as commercial feeds.
 */
function isCustomFeed(feed) {
    return [CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX].some(function (value) { return feed.startsWith(value); });
}
function getCompanyFeeds(cardFeeds, shouldFilterOutRemovedFeeds, shouldFilterOutPendingFeeds) {
    var _a, _b;
    if (shouldFilterOutRemovedFeeds === void 0) { shouldFilterOutRemovedFeeds = false; }
    if (shouldFilterOutPendingFeeds === void 0) { shouldFilterOutPendingFeeds = false; }
    return Object.fromEntries(Object.entries((_b = (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.companyCards) !== null && _b !== void 0 ? _b : {}).filter(function (_a) {
        var key = _a[0], value = _a[1];
        if (shouldFilterOutRemovedFeeds && value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return false;
        }
        if (shouldFilterOutPendingFeeds && value.pending) {
            return false;
        }
        return key !== CONST_1.default.EXPENSIFY_CARD.BANK;
    }));
}
function getBankName(feedType) {
    var _a;
    var feedNamesMapping = (_a = {},
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA] = 'Visa',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = 'Mastercard',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX] = 'American Express',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.STRIPE] = 'Stripe',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT] = 'American Express',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA] = 'Bank of America',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE] = 'Capital One',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CHASE] = 'Chase',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CITIBANK] = 'Citibank',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO] = 'Wells Fargo',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.BREX] = 'Brex',
        _a[CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CSV] = CONST_1.default.COMPANY_CARDS.CARD_TYPE.CSV,
        _a);
    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, oauth.americanexpressfdx.com 2003
    var feedKey = Object.keys(feedNamesMapping).find(function (feed) { return feedType.startsWith(feed); });
    if (feedType.includes(CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.CSV)) {
        return CONST_1.default.COMPANY_CARDS.CARD_TYPE.CSV;
    }
    if (!feedKey) {
        return '';
    }
    return feedNamesMapping[feedKey];
}
var getBankCardDetailsImage = function (bank, illustrations) {
    var _a;
    var iconMap = (_a = {},
        _a[CONST_1.default.COMPANY_CARDS.BANKS.AMEX] = Illustrations.AmexCardCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.BANK_OF_AMERICA] = Illustrations.BankOfAmericaCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.CAPITAL_ONE] = Illustrations.CapitalOneCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.CHASE] = Illustrations.ChaseCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.CITI_BANK] = Illustrations.CitibankCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.WELLS_FARGO] = Illustrations.WellsFargoCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.BREX] = Illustrations.BrexCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.STRIPE] = Illustrations.StripeCompanyCardDetail,
        _a[CONST_1.default.COMPANY_CARDS.BANKS.OTHER] = illustrations.GenericCompanyCard,
        _a);
    return iconMap[bank];
};
exports.getBankCardDetailsImage = getBankCardDetailsImage;
function getCustomOrFormattedFeedName(feed, companyCardNicknames) {
    if (!feed) {
        return;
    }
    var customFeedName = companyCardNicknames === null || companyCardNicknames === void 0 ? void 0 : companyCardNicknames[feed];
    if (customFeedName && typeof customFeedName !== 'string') {
        return '';
    }
    var formattedFeedName = (0, Localize_1.translateLocal)('workspace.companyCards.feedName', { feedName: getBankName(feed) });
    return customFeedName !== null && customFeedName !== void 0 ? customFeedName : formattedFeedName;
}
function getPlaidInstitutionIconUrl(feedName) {
    var institutionId = getPlaidInstitutionId(feedName);
    if (!institutionId) {
        return '';
    }
    return "".concat(CONST_1.default.COMPANY_CARD_PLAID).concat(institutionId, ".png");
}
function getPlaidInstitutionId(feedName) {
    var feed = feedName === null || feedName === void 0 ? void 0 : feedName.split('.');
    if (!feed || (feed === null || feed === void 0 ? void 0 : feed.at(0)) !== CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        return '';
    }
    return feed.at(1);
}
function isPlaidSupportedCountry(selectedCountry) {
    if (!selectedCountry) {
        return false;
    }
    return CONST_1.default.PLAID_SUPPORT_COUNTRIES.includes(selectedCountry);
}
function getDomainOrWorkspaceAccountID(workspaceAccountID, cardFeedData) {
    var _a;
    return (_a = cardFeedData === null || cardFeedData === void 0 ? void 0 : cardFeedData.domainID) !== null && _a !== void 0 ? _a : workspaceAccountID;
}
function getPlaidCountry(outputCurrency, currencyList, countryByIp) {
    var selectedCurrency = outputCurrency ? currencyList === null || currencyList === void 0 ? void 0 : currencyList[outputCurrency] : null;
    var countries = selectedCurrency === null || selectedCurrency === void 0 ? void 0 : selectedCurrency.countries;
    if (outputCurrency === CONST_1.default.CURRENCY.EUR) {
        if (countryByIp && (countries === null || countries === void 0 ? void 0 : countries.includes(countryByIp))) {
            return countryByIp;
        }
        return '';
    }
    var country = countries === null || countries === void 0 ? void 0 : countries[0];
    return country !== null && country !== void 0 ? country : '';
}
// We will simplify the logic below once we have #50450 #50451 implemented
var getCorrectStepForSelectedBank = function (selectedBank) {
    var banksWithFeedType = [
        CONST_1.default.COMPANY_CARDS.BANKS.BANK_OF_AMERICA,
        CONST_1.default.COMPANY_CARDS.BANKS.CAPITAL_ONE,
        CONST_1.default.COMPANY_CARDS.BANKS.CHASE,
        CONST_1.default.COMPANY_CARDS.BANKS.CITI_BANK,
        CONST_1.default.COMPANY_CARDS.BANKS.WELLS_FARGO,
    ];
    if (selectedBank === CONST_1.default.COMPANY_CARDS.BANKS.STRIPE) {
        return CONST_1.default.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS;
    }
    if (selectedBank === CONST_1.default.COMPANY_CARDS.BANKS.AMEX) {
        return CONST_1.default.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED;
    }
    if (selectedBank === CONST_1.default.COMPANY_CARDS.BANKS.BREX) {
        return CONST_1.default.COMPANY_CARDS.STEP.BANK_CONNECTION;
    }
    if (selectedBank === CONST_1.default.COMPANY_CARDS.BANKS.OTHER) {
        return CONST_1.default.COMPANY_CARDS.STEP.CARD_TYPE;
    }
    if (banksWithFeedType.includes(selectedBank)) {
        return CONST_1.default.COMPANY_CARDS.STEP.SELECT_FEED_TYPE;
    }
    return CONST_1.default.COMPANY_CARDS.STEP.CARD_TYPE;
};
exports.getCorrectStepForSelectedBank = getCorrectStepForSelectedBank;
function getCorrectStepForPlaidSelectedBank(selectedBank) {
    if (selectedBank === CONST_1.default.COMPANY_CARDS.BANKS.STRIPE) {
        return CONST_1.default.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS;
    }
    if (selectedBank === CONST_1.default.COMPANY_CARDS.BANKS.OTHER) {
        return CONST_1.default.COMPANY_CARDS.STEP.PLAID_CONNECTION;
    }
    return CONST_1.default.COMPANY_CARDS.STEP.BANK_CONNECTION;
}
function getSelectedFeed(lastSelectedFeed, cardFeeds) {
    var defaultFeed = Object.keys(getCompanyFeeds(cardFeeds, true)).at(0);
    return lastSelectedFeed !== null && lastSelectedFeed !== void 0 ? lastSelectedFeed : defaultFeed;
}
function isSelectedFeedExpired(directFeed) {
    if (!directFeed || !directFeed.expiration) {
        return false;
    }
    return (0, date_fns_1.isBefore)((0, date_fns_1.fromUnixTime)(directFeed.expiration), new Date());
}
/** Returns list of cards which can be assigned */
function getFilteredCardList(list, directFeed, workspaceCardFeeds) {
    if (workspaceCardFeeds === void 0) { workspaceCardFeeds = allWorkspaceCards; }
    var _a = list !== null && list !== void 0 ? list : {}, customFeedCardsToAssign = _a.cardList, cards = __rest(_a, ["cardList"]);
    var assignedCards = Object.values(cards).map(function (card) { return card.cardName; });
    // Get cards assigned across all workspaces
    var allWorkspaceAssignedCards = new Set();
    Object.values(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : {}).forEach(function (workspaceCards) {
        if (!workspaceCards) {
            return;
        }
        var cardList = workspaceCards.cardList, workspaceCardItems = __rest(workspaceCards, ["cardList"]);
        Object.values(workspaceCardItems).forEach(function (card) {
            if (!(card === null || card === void 0 ? void 0 : card.cardName)) {
                return;
            }
            allWorkspaceAssignedCards.add(card.cardName);
        });
    });
    if (directFeed) {
        var unassignedDirectFeedCards = directFeed.accountList.filter(function (cardNumber) { return !assignedCards.includes(cardNumber) && !allWorkspaceAssignedCards.has(cardNumber); });
        return Object.fromEntries(unassignedDirectFeedCards.map(function (cardNumber) { return [cardNumber, cardNumber]; }));
    }
    return Object.fromEntries(Object.entries(customFeedCardsToAssign !== null && customFeedCardsToAssign !== void 0 ? customFeedCardsToAssign : {}).filter(function (_a) {
        var cardNumber = _a[0];
        return !assignedCards.includes(cardNumber) && !allWorkspaceAssignedCards.has(cardNumber);
    }));
}
function hasOnlyOneCardToAssign(list) {
    return Object.keys(list).length === 1;
}
function getDefaultCardName(cardholder) {
    if (!cardholder) {
        return '';
    }
    return "".concat(cardholder, "'s card");
}
function checkIfNewFeedConnected(prevFeedsData, currentFeedsData, plaidBank) {
    var prevFeeds = Object.keys(prevFeedsData);
    var currentFeeds = Object.keys(currentFeedsData);
    return {
        isNewFeedConnected: currentFeeds.length > prevFeeds.length || (plaidBank && currentFeeds.includes("".concat(CONST_1.default.BANK_ACCOUNT.SETUP_TYPE.PLAID, ".").concat(plaidBank))),
        newFeed: currentFeeds.find(function (feed) { return !prevFeeds.includes(feed); }),
    };
}
function filterInactiveCards(cards) {
    var closedStates = [CONST_1.default.EXPENSIFY_CARD.STATE.CLOSED, CONST_1.default.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED, CONST_1.default.EXPENSIFY_CARD.STATE.STATE_SUSPENDED];
    return (0, ObjectUtils_1.filterObject)(cards !== null && cards !== void 0 ? cards : {}, function (key, card) { return !closedStates.includes(card.state); });
}
function getAllCardsForWorkspace(workspaceAccountID, allCardList, cardFeeds, expensifyCardSettings) {
    var _a, _b;
    if (allCardList === void 0) { allCardList = allWorkspaceCards; }
    var cards = {};
    var companyCardsDomainFeeds = Object.entries((_b = (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.companyCards) !== null && _b !== void 0 ? _b : {}).map(function (_a) {
        var feedName = _a[0], feedData = _a[1];
        return ({ domainID: feedData.domainID, feedName: feedName });
    });
    var expensifyCardsDomainIDs = Object.keys(expensifyCardSettings !== null && expensifyCardSettings !== void 0 ? expensifyCardSettings : {})
        .map(function (key) { return key.split('_').at(-1); })
        .filter(function (id) { return !!id; });
    var _loop_1 = function (key, values) {
        var isWorkspaceAccountCards = key.includes(workspaceAccountID.toString());
        var isCompanyDomainCards = companyCardsDomainFeeds === null || companyCardsDomainFeeds === void 0 ? void 0 : companyCardsDomainFeeds.some(function (domainFeed) { return domainFeed.domainID && key.includes(domainFeed.domainID.toString()) && key.includes(domainFeed.feedName); });
        var isExpensifyDomainCards = expensifyCardsDomainIDs.some(function (domainID) { return key.includes(domainID.toString()) && key.includes(CONST_1.default.EXPENSIFY_CARD.BANK); });
        if ((isWorkspaceAccountCards || isCompanyDomainCards || isExpensifyDomainCards) && values) {
            var cardList = values.cardList, rest = __rest(values, ["cardList"]);
            var filteredCards = filterInactiveCards(rest);
            Object.assign(cards, filteredCards);
        }
    };
    for (var _i = 0, _c = Object.entries(allCardList !== null && allCardList !== void 0 ? allCardList : {}); _i < _c.length; _i++) {
        var _d = _c[_i], key = _d[0], values = _d[1];
        _loop_1(key, values);
    }
    return cards;
}
function isSmartLimitEnabled(cards) {
    return Object.values(cards).some(function (card) { var _a; return ((_a = card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.limitType) === CONST_1.default.EXPENSIFY_CARD.LIMIT_TYPES.SMART; });
}
var CUSTOM_FEEDS = [CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.VISA, CONST_1.default.COMPANY_CARD.FEED_BANK_NAME.AMEX];
function getFeedType(feedKey, cardFeeds) {
    var _a, _b;
    if (CUSTOM_FEEDS.some(function (feed) { return feed === feedKey; })) {
        var filteredFeeds = Object.keys((_b = (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.companyCards) !== null && _b !== void 0 ? _b : {}).filter(function (str) { return str.includes(feedKey); });
        var feedNumbers = filteredFeeds.map(function (str) { return parseInt(str.replace(feedKey, ''), 10); }).filter(Boolean);
        feedNumbers.sort(function (a, b) { return a - b; });
        var firstAvailableNumber = 1;
        for (var _i = 0, feedNumbers_1 = feedNumbers; _i < feedNumbers_1.length; _i++) {
            var num = feedNumbers_1[_i];
            if (num && num !== firstAvailableNumber) {
                return "".concat(feedKey).concat(firstAvailableNumber);
            }
            firstAvailableNumber++;
        }
        return "".concat(feedKey).concat(firstAvailableNumber);
    }
    return feedKey;
}
/**
 * Takes the list of cards divided by workspaces and feeds and returns the flattened non-Expensify cards related to the provided workspace
 *
 * @param allCardsList the list where cards split by workspaces and feeds and stored under `card_${workspaceAccountID}_${feedName}` keys
 * @param workspaceAccountID the workspace account id we want to get cards for
 * @param domainIDs the domain ids we want to get cards for
 */
function flatAllCardsList(allCardsList, workspaceAccountID, domainIDs) {
    if (!allCardsList) {
        return;
    }
    return Object.entries(allCardsList).reduce(function (acc, _a) {
        var key = _a[0], cards = _a[1];
        var isWorkspaceAccountCards = key.includes(workspaceAccountID.toString());
        var isDomainCards = domainIDs === null || domainIDs === void 0 ? void 0 : domainIDs.some(function (domainID) { return key.includes(domainID.toString()); });
        if ((!isWorkspaceAccountCards && !isDomainCards) || key.includes(CONST_1.default.EXPENSIFY_CARD.BANK)) {
            return acc;
        }
        var _b = cards !== null && cards !== void 0 ? cards : {}, cardList = _b.cardList, feedCards = __rest(_b, ["cardList"]);
        var filteredCards = filterInactiveCards(feedCards);
        Object.assign(acc, filteredCards);
        return acc;
    }, {});
}
/**
 * Check if any card from the provided feed(s) has a broken connection
 *
 * @param feedCards the list of the cards, related to one or several feeds
 * @param [feedToExclude] the feed to ignore during the check, it's useful for checking broken connection error only in the feeds other than the selected one
 */
function checkIfFeedConnectionIsBroken(feedCards, feedToExclude) {
    if (!feedCards || (0, EmptyObject_1.isEmptyObject)(feedCards)) {
        return false;
    }
    return Object.values(feedCards).some(function (card) { return !(0, EmptyObject_1.isEmptyObject)(card) && card.bank !== feedToExclude && card.lastScrapeResult !== 200; });
}
/**
 * Checks if an Expensify Card was issued for a given workspace.
 */
function hasIssuedExpensifyCard(workspaceAccountID, allCardList) {
    if (allCardList === void 0) { allCardList = allWorkspaceCards; }
    var cards = getAllCardsForWorkspace(workspaceAccountID, allCardList);
    return Object.values(cards).some(function (card) { return card.bank === CONST_1.default.EXPENSIFY_CARD.BANK; });
}
function hasCardListObject(workspaceAccountID, feedName) {
    var _a;
    var workspaceCards = (_a = allWorkspaceCards === null || allWorkspaceCards === void 0 ? void 0 : allWorkspaceCards["cards_".concat(workspaceAccountID, "_").concat(feedName)]) !== null && _a !== void 0 ? _a : {};
    return !!workspaceCards.cardList;
}
/**
 * Check if the Expensify Card is fully set up and a new card can be issued
 */
function isExpensifyCardFullySetUp(policy, cardSettings) {
    return !!((policy === null || policy === void 0 ? void 0 : policy.areExpensifyCardsEnabled) && (cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID));
}
function getFundIdFromSettingsKey(key) {
    var prefix = ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS;
    if (!(key === null || key === void 0 ? void 0 : key.startsWith(prefix))) {
        return CONST_1.default.DEFAULT_NUMBER_ID;
    }
    var fundIDStr = key.substring(prefix.length);
    var fundID = Number(fundIDStr);
    return Number.isNaN(fundID) ? CONST_1.default.DEFAULT_NUMBER_ID : fundID;
}
function getCustomCardName(cardID) {
    return customCardNames === null || customCardNames === void 0 ? void 0 : customCardNames[cardID];
}
