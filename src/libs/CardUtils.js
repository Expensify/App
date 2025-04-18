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
exports.__esModule = true;
exports.getFundIdFromSettingsKey = exports.filterInactiveCards = exports.isExpensifyCardFullySetUp = exports.hasCardListObject = exports.hasIssuedExpensifyCard = exports.lastFourNumbersFromCardName = exports.isSmartLimitEnabled = exports.checkIfFeedConnectionIsBroken = exports.flatAllCardsList = exports.getFeedType = exports.isCardHiddenFromSearch = exports.isCardIssued = exports.getAllCardsForWorkspace = exports.isCard = exports.mergeCardListWithWorkspaceFeeds = exports.getDefaultCardName = exports.checkIfNewFeedConnected = exports.hasOnlyOneCardToAssign = exports.getFilteredCardList = exports.isCardClosed = exports.getCustomOrFormattedFeedName = exports.getCorrectStepForSelectedBank = exports.getSelectedFeed = exports.getBankCardDetailsImage = exports.isCustomFeed = exports.getCompanyFeeds = exports.isSelectedFeedExpired = exports.getBankName = exports.getCardFeedIcon = exports.sortCardsByCardholderName = exports.getEligibleBankAccountsForCard = exports.getTranslationKeyForLimitType = exports.getMCardNumberString = exports.hasDetectedFraud = exports.findPhysicalCard = exports.getCardDescription = exports.maskCardNumber = exports.maskCard = exports.getYearFromExpirationDateString = exports.getMonthFromExpirationDateString = exports.formatCardExpiration = exports.getDomainCards = exports.isCorporateCard = exports.isExpensifyCard = void 0;
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
var allCards = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].CARD_LIST,
    callback: function (val) {
        if (!val || Object.keys(val).length === 0) {
            return;
        }
        allCards = val;
    }
});
var allWorkspaceCards = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.WORKSPACE_CARDS_LIST,
    waitForCollectionCallback: true,
    callback: function (value) {
        allWorkspaceCards = value;
    }
});
/**
 * @returns string with a month in MM format
 */
function getMonthFromExpirationDateString(expirationDateString) {
    return expirationDateString.substring(0, 2);
}
exports.getMonthFromExpirationDateString = getMonthFromExpirationDateString;
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
    return card.bank === CONST_1["default"].EXPENSIFY_CARD.BANK;
}
exports.isExpensifyCard = isExpensifyCard;
/**
 * @param cardID
 * @returns boolean if the cardID is in the cardList from ONYX. Includes Expensify Cards.
 */
function isCorporateCard(cardID) {
    return !!allCards[cardID];
}
exports.isCorporateCard = isCorporateCard;
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
    var cardDescriptor = card.state === CONST_1["default"].EXPENSIFY_CARD.STATE.NOT_ACTIVATED ? Localize_1.translateLocal('cardTransactions.notActivated') : card.lastFourPAN;
    var humanReadableBankName = card.bank === CONST_1["default"].EXPENSIFY_CARD.BANK ? CONST_1["default"].EXPENSIFY_CARD.BANK : getBankName(card.bank);
    return cardDescriptor ? humanReadableBankName + " - " + cardDescriptor : "" + humanReadableBankName;
}
exports.getCardDescription = getCardDescription;
function isCard(item) {
    return typeof item === 'object' && 'cardID' in item && !!item.cardID && 'bank' in item && !!item.bank;
}
exports.isCard = isCard;
function isCardIssued(card) {
    var _a;
    return !!((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.isVirtual) || (card === null || card === void 0 ? void 0 : card.state) !== CONST_1["default"].EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED;
}
exports.isCardIssued = isCardIssued;
function isCardHiddenFromSearch(card) {
    var _a, _b;
    return !((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.isVirtual) && CONST_1["default"].EXPENSIFY_CARD.HIDDEN_FROM_SEARCH_STATES.includes((_b = card.state) !== null && _b !== void 0 ? _b : 0);
}
exports.isCardHiddenFromSearch = isCardHiddenFromSearch;
function isCardClosed(card) {
    return (card === null || card === void 0 ? void 0 : card.state) === CONST_1["default"].EXPENSIFY_CARD.STATE.CLOSED;
}
exports.isCardClosed = isCardClosed;
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
exports.mergeCardListWithWorkspaceFeeds = mergeCardListWithWorkspaceFeeds;
/**
 * @returns string with a year in YY or YYYY format
 */
function getYearFromExpirationDateString(expirationDateString) {
    var stringContainsNumbersOnly = /^\d+$/.test(expirationDateString);
    var cardYear = stringContainsNumbersOnly ? expirationDateString.substring(2) : expirationDateString.substring(3);
    return cardYear.length === 2 ? "20" + cardYear : cardYear;
}
exports.getYearFromExpirationDateString = getYearFromExpirationDateString;
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
    return expirationMonth + "/" + expirationYear;
}
exports.formatCardExpiration = formatCardExpiration;
/**
 * @param cardList - collection of assigned cards
 * @returns collection of assigned cards grouped by domain
 */
function getDomainCards(cardList) {
    // Check for domainName to filter out personal credit cards.
    var activeCards = Object.values(cardList !== null && cardList !== void 0 ? cardList : {}).filter(function (card) { return !!(card === null || card === void 0 ? void 0 : card.domainName) && CONST_1["default"].EXPENSIFY_CARD.ACTIVE_STATES.some(function (element) { return element === card.state; }); });
    return groupBy_1["default"](activeCards, function (card) { return card.domainName; });
}
exports.getDomainCards = getDomainCards;
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
exports.maskCard = maskCard;
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
    var isAmexBank = [CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX, CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT].some(function (value) { return value === feed; });
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
exports.maskCardNumber = maskCardNumber;
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
exports.lastFourNumbersFromCardName = lastFourNumbersFromCardName;
/**
 * Finds physical card in a list of cards
 *
 * @returns a physical card object (or undefined if none is found)
 */
function findPhysicalCard(cards) {
    return cards.find(function (card) { var _a; return !((_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.isVirtual); });
}
exports.findPhysicalCard = findPhysicalCard;
/**
 * Checks if any of the cards in the list have detected fraud
 *
 * @param cardList - collection of assigned cards
 */
function hasDetectedFraud(cardList) {
    return Object.values(cardList).some(function (card) { return card.fraud !== CONST_1["default"].EXPENSIFY_CARD.FRAUD_TYPES.NONE; });
}
exports.hasDetectedFraud = hasDetectedFraud;
function getMCardNumberString(cardNumber) {
    return cardNumber.replace(/\s/g, '');
}
exports.getMCardNumberString = getMCardNumberString;
function getTranslationKeyForLimitType(limitType) {
    switch (limitType) {
        case CONST_1["default"].EXPENSIFY_CARD.LIMIT_TYPES.SMART:
            return 'workspace.card.issueNewCard.smartLimit';
        case CONST_1["default"].EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
            return 'workspace.card.issueNewCard.fixedAmount';
        case CONST_1["default"].EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
            return 'workspace.card.issueNewCard.monthly';
        default:
            return '';
    }
}
exports.getTranslationKeyForLimitType = getTranslationKeyForLimitType;
function getEligibleBankAccountsForCard(bankAccountsList) {
    if (!bankAccountsList || EmptyObject_1.isEmptyObject(bankAccountsList)) {
        return [];
    }
    return Object.values(bankAccountsList).filter(function (bankAccount) { var _a, _b; return ((_a = bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.accountData) === null || _a === void 0 ? void 0 : _a.type) === CONST_1["default"].BANK_ACCOUNT.TYPE.BUSINESS && ((_b = bankAccount === null || bankAccount === void 0 ? void 0 : bankAccount.accountData) === null || _b === void 0 ? void 0 : _b.allowDebit); });
}
exports.getEligibleBankAccountsForCard = getEligibleBankAccountsForCard;
function sortCardsByCardholderName(cardsList, personalDetails) {
    var _a = cardsList !== null && cardsList !== void 0 ? cardsList : {}, cardList = _a.cardList, cards = __rest(_a, ["cardList"]);
    return Object.values(cards).sort(function (cardA, cardB) {
        var _a, _b;
        var userA = cardA.accountID ? (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[cardA.accountID]) !== null && _a !== void 0 ? _a : {} : {};
        var userB = cardB.accountID ? (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[cardB.accountID]) !== null && _b !== void 0 ? _b : {} : {};
        var aName = PersonalDetailsUtils_1.getDisplayNameOrDefault(userA);
        var bName = PersonalDetailsUtils_1.getDisplayNameOrDefault(userB);
        return LocaleCompare_1["default"](aName, bName);
    });
}
exports.sortCardsByCardholderName = sortCardsByCardholderName;
function getCardFeedIcon(cardFeed, illustrations) {
    var _a;
    var feedIcons = (_a = {},
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.VISA] = Illustrations.VisaCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX] = Illustrations.AmexCardCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = Illustrations.MasterCardCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT] = Illustrations.AmexCardCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA] = Illustrations.BankOfAmericaCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE] = Illustrations.CapitalOneCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CHASE] = Illustrations.ChaseCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CITIBANK] = Illustrations.CitibankCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO] = Illustrations.WellsFargoCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.BREX] = Illustrations.BrexCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.STRIPE] = Illustrations.StripeCompanyCardDetailLarge,
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CSV] = illustrations.GenericCSVCompanyCardLarge,
        _a[CONST_1["default"].EXPENSIFY_CARD.BANK] = expensify_card_svg_1["default"],
        _a);
    if (cardFeed.startsWith(CONST_1["default"].EXPENSIFY_CARD.BANK)) {
        return expensify_card_svg_1["default"];
    }
    if (feedIcons[cardFeed]) {
        return feedIcons[cardFeed];
    }
    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, cdfbmo
    var feedKey = Object.keys(feedIcons).find(function (feed) { return cardFeed.startsWith(feed); });
    if (feedKey) {
        return feedIcons[feedKey];
    }
    if (cardFeed.includes(CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CSV)) {
        return illustrations.GenericCSVCompanyCardLarge;
    }
    return illustrations.GenericCompanyCardLarge;
}
exports.getCardFeedIcon = getCardFeedIcon;
/**
 * Verify if the feed is a custom feed. Those are also refered to as commercial feeds.
 */
function isCustomFeed(feed) {
    return [CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.VISA, CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX].some(function (value) { return feed.startsWith(value); });
}
exports.isCustomFeed = isCustomFeed;
function getCompanyFeeds(cardFeeds, shouldFilterOutRemovedFeeds, shouldFilterOutPendingFeeds) {
    var _a, _b;
    if (shouldFilterOutRemovedFeeds === void 0) { shouldFilterOutRemovedFeeds = false; }
    if (shouldFilterOutPendingFeeds === void 0) { shouldFilterOutPendingFeeds = false; }
    return Object.fromEntries(Object.entries((_b = (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.companyCards) !== null && _b !== void 0 ? _b : {}).filter(function (_a) {
        var key = _a[0], value = _a[1];
        if (shouldFilterOutRemovedFeeds && value.pendingAction === CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return false;
        }
        if (shouldFilterOutPendingFeeds && value.pending) {
            return false;
        }
        return key !== CONST_1["default"].EXPENSIFY_CARD.BANK;
    }));
}
exports.getCompanyFeeds = getCompanyFeeds;
function getBankName(feedType) {
    var _a;
    var feedNamesMapping = (_a = {},
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.VISA] = 'Visa',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD] = 'Mastercard',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX] = 'American Express',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.STRIPE] = 'Stripe',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT] = 'American Express',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA] = 'Bank of America',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE] = 'Capital One',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CHASE] = 'Chase',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CITIBANK] = 'Citibank',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO] = 'Wells Fargo',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.BREX] = 'Brex',
        _a[CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CSV] = CONST_1["default"].COMPANY_CARDS.CARD_TYPE.CSV,
        _a);
    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, oauth.americanexpressfdx.com 2003
    var feedKey = Object.keys(feedNamesMapping).find(function (feed) { return feedType.startsWith(feed); });
    if (feedType.includes(CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.CSV)) {
        return CONST_1["default"].COMPANY_CARDS.CARD_TYPE.CSV;
    }
    if (!feedKey) {
        return '';
    }
    return feedNamesMapping[feedKey];
}
exports.getBankName = getBankName;
var getBankCardDetailsImage = function (bank, illustrations) {
    var _a;
    var iconMap = (_a = {},
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.AMEX] = Illustrations.AmexCardCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.BANK_OF_AMERICA] = Illustrations.BankOfAmericaCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.CAPITAL_ONE] = Illustrations.CapitalOneCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.CHASE] = Illustrations.ChaseCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.CITI_BANK] = Illustrations.CitibankCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.WELLS_FARGO] = Illustrations.WellsFargoCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.BREX] = Illustrations.BrexCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.STRIPE] = Illustrations.StripeCompanyCardDetail,
        _a[CONST_1["default"].COMPANY_CARDS.BANKS.OTHER] = illustrations.GenericCompanyCard,
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
    var formattedFeedName = Localize_1.translateLocal('workspace.companyCards.feedName', { feedName: getBankName(feed) });
    return customFeedName !== null && customFeedName !== void 0 ? customFeedName : formattedFeedName;
}
exports.getCustomOrFormattedFeedName = getCustomOrFormattedFeedName;
// We will simplify the logic below once we have #50450 #50451 implemented
var getCorrectStepForSelectedBank = function (selectedBank) {
    var banksWithFeedType = [
        CONST_1["default"].COMPANY_CARDS.BANKS.BANK_OF_AMERICA,
        CONST_1["default"].COMPANY_CARDS.BANKS.CAPITAL_ONE,
        CONST_1["default"].COMPANY_CARDS.BANKS.CHASE,
        CONST_1["default"].COMPANY_CARDS.BANKS.CITI_BANK,
        CONST_1["default"].COMPANY_CARDS.BANKS.WELLS_FARGO,
    ];
    if (selectedBank === CONST_1["default"].COMPANY_CARDS.BANKS.STRIPE) {
        return CONST_1["default"].COMPANY_CARDS.STEP.CARD_INSTRUCTIONS;
    }
    if (selectedBank === CONST_1["default"].COMPANY_CARDS.BANKS.AMEX) {
        return CONST_1["default"].COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED;
    }
    if (selectedBank === CONST_1["default"].COMPANY_CARDS.BANKS.BREX) {
        return CONST_1["default"].COMPANY_CARDS.STEP.BANK_CONNECTION;
    }
    if (selectedBank === CONST_1["default"].COMPANY_CARDS.BANKS.OTHER) {
        return CONST_1["default"].COMPANY_CARDS.STEP.CARD_TYPE;
    }
    if (banksWithFeedType.includes(selectedBank)) {
        return CONST_1["default"].COMPANY_CARDS.STEP.SELECT_FEED_TYPE;
    }
    return CONST_1["default"].COMPANY_CARDS.STEP.CARD_TYPE;
};
exports.getCorrectStepForSelectedBank = getCorrectStepForSelectedBank;
function getSelectedFeed(lastSelectedFeed, cardFeeds) {
    var defaultFeed = Object.keys(getCompanyFeeds(cardFeeds, true)).at(0);
    return lastSelectedFeed !== null && lastSelectedFeed !== void 0 ? lastSelectedFeed : defaultFeed;
}
exports.getSelectedFeed = getSelectedFeed;
function isSelectedFeedExpired(directFeed) {
    if (!directFeed) {
        return false;
    }
    return date_fns_1.isBefore(date_fns_1.fromUnixTime(directFeed.expiration), new Date());
}
exports.isSelectedFeedExpired = isSelectedFeedExpired;
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
            if (!card.cardName) {
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
exports.getFilteredCardList = getFilteredCardList;
function hasOnlyOneCardToAssign(list) {
    return Object.keys(list).length === 1;
}
exports.hasOnlyOneCardToAssign = hasOnlyOneCardToAssign;
function getDefaultCardName(cardholder) {
    if (!cardholder) {
        return '';
    }
    return cardholder + "'s card";
}
exports.getDefaultCardName = getDefaultCardName;
function checkIfNewFeedConnected(prevFeedsData, currentFeedsData) {
    var prevFeeds = Object.keys(prevFeedsData);
    var currentFeeds = Object.keys(currentFeedsData);
    return {
        isNewFeedConnected: currentFeeds.length > prevFeeds.length,
        newFeed: currentFeeds.find(function (feed) { return !prevFeeds.includes(feed); })
    };
}
exports.checkIfNewFeedConnected = checkIfNewFeedConnected;
function filterInactiveCards(cards) {
    var closedStates = [CONST_1["default"].EXPENSIFY_CARD.STATE.CLOSED, CONST_1["default"].EXPENSIFY_CARD.STATE.STATE_DEACTIVATED, CONST_1["default"].EXPENSIFY_CARD.STATE.STATE_SUSPENDED];
    return ObjectUtils_1.filterObject(cards !== null && cards !== void 0 ? cards : {}, function (key, card) { return !closedStates.includes(card.state); });
}
exports.filterInactiveCards = filterInactiveCards;
function getAllCardsForWorkspace(workspaceAccountID, allCardList) {
    if (allCardList === void 0) { allCardList = allWorkspaceCards; }
    var cards = {};
    for (var _i = 0, _a = Object.entries(allCardList !== null && allCardList !== void 0 ? allCardList : {}); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], values = _b[1];
        if (key.includes(workspaceAccountID.toString()) && values) {
            var cardList = values.cardList, rest = __rest(values, ["cardList"]);
            var filteredCards = filterInactiveCards(rest);
            Object.assign(cards, filteredCards);
        }
    }
    return cards;
}
exports.getAllCardsForWorkspace = getAllCardsForWorkspace;
function isSmartLimitEnabled(cards) {
    return Object.values(cards).some(function (card) { var _a; return ((_a = card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.limitType) === CONST_1["default"].EXPENSIFY_CARD.LIMIT_TYPES.SMART; });
}
exports.isSmartLimitEnabled = isSmartLimitEnabled;
var CUSTOM_FEEDS = [CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.VISA, CONST_1["default"].COMPANY_CARD.FEED_BANK_NAME.AMEX];
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
                return "" + feedKey + firstAvailableNumber;
            }
            firstAvailableNumber++;
        }
        return "" + feedKey + firstAvailableNumber;
    }
    return feedKey;
}
exports.getFeedType = getFeedType;
/**
 * Takes the list of cards divided by workspaces and feeds and returns the flattened non-Expensify cards related to the provided workspace
 *
 * @param allCardsList the list where cards split by workspaces and feeds and stored under `card_${workspaceAccountID}_${feedName}` keys
 * @param workspaceAccountID the workspace account id we want to get cards for
 */
function flatAllCardsList(allCardsList, workspaceAccountID) {
    if (!allCardsList) {
        return;
    }
    return Object.entries(allCardsList).reduce(function (acc, _a) {
        var key = _a[0], cards = _a[1];
        if (!key.includes(workspaceAccountID.toString()) || key.includes(CONST_1["default"].EXPENSIFY_CARD.BANK)) {
            return acc;
        }
        var _b = cards !== null && cards !== void 0 ? cards : {}, cardList = _b.cardList, feedCards = __rest(_b, ["cardList"]);
        var filteredCards = filterInactiveCards(feedCards);
        Object.assign(acc, filteredCards);
        return acc;
    }, {});
}
exports.flatAllCardsList = flatAllCardsList;
/**
 * Check if any card from the provided feed(s) has a broken connection
 *
 * @param feedCards the list of the cards, related to one or several feeds
 * @param [feedToExclude] the feed to ignore during the check, it's useful for checking broken connection error only in the feeds other than the selected one
 */
function checkIfFeedConnectionIsBroken(feedCards, feedToExclude) {
    if (!feedCards || EmptyObject_1.isEmptyObject(feedCards)) {
        return false;
    }
    return Object.values(feedCards).some(function (card) { return !EmptyObject_1.isEmptyObject(card) && card.bank !== feedToExclude && card.lastScrapeResult !== 200; });
}
exports.checkIfFeedConnectionIsBroken = checkIfFeedConnectionIsBroken;
/**
 * Checks if an Expensify Card was issued for a given workspace.
 */
function hasIssuedExpensifyCard(workspaceAccountID, allCardList) {
    if (allCardList === void 0) { allCardList = allWorkspaceCards; }
    var cards = getAllCardsForWorkspace(workspaceAccountID, allCardList);
    return Object.values(cards).some(function (card) { return card.bank === CONST_1["default"].EXPENSIFY_CARD.BANK; });
}
exports.hasIssuedExpensifyCard = hasIssuedExpensifyCard;
function hasCardListObject(workspaceAccountID, feedName) {
    var _a;
    var workspaceCards = (_a = allWorkspaceCards === null || allWorkspaceCards === void 0 ? void 0 : allWorkspaceCards["cards_" + workspaceAccountID + "_" + feedName]) !== null && _a !== void 0 ? _a : {};
    return !!workspaceCards.cardList;
}
exports.hasCardListObject = hasCardListObject;
/**
 * Check if the Expensify Card is fully set up and a new card can be issued
 */
function isExpensifyCardFullySetUp(policy, cardSettings) {
    return !!((policy === null || policy === void 0 ? void 0 : policy.areExpensifyCardsEnabled) && (cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.paymentBankAccountID));
}
exports.isExpensifyCardFullySetUp = isExpensifyCardFullySetUp;
function getFundIdFromSettingsKey(key) {
    var prefix = ONYXKEYS_1["default"].COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS;
    if (!(key === null || key === void 0 ? void 0 : key.startsWith(prefix))) {
        return CONST_1["default"].DEFAULT_NUMBER_ID;
    }
    var fundIDStr = key.substring(prefix.length);
    var fundID = Number(fundIDStr);
    return Number.isNaN(fundID) ? CONST_1["default"].DEFAULT_NUMBER_ID : fundID;
}
exports.getFundIdFromSettingsKey = getFundIdFromSettingsKey;
