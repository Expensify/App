'use strict';
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.getDomainFeedData =
    exports.generateDomainFeedData =
    exports.getWorkspaceCardFeedKey =
    exports.getCardFeedKey =
    exports.createCardFeedKey =
    exports.getSelectedCardsFromFeeds =
    exports.generateSelectedCards =
    exports.buildCardFeedsData =
    exports.getCardFeedNamesWithType =
    exports.buildCardsData =
        void 0;
var CONST_1 = require('@src/CONST');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var EmptyObject_1 = require('@src/types/utils/EmptyObject');
var CardUtils_1 = require('./CardUtils');
var PolicyUtils_1 = require('./PolicyUtils');
function getRepeatingBanks(workspaceCardFeedsKeys, domainFeedsData) {
    var bankFrequency = {};
    for (var _i = 0, workspaceCardFeedsKeys_1 = workspaceCardFeedsKeys; _i < workspaceCardFeedsKeys_1.length; _i++) {
        var key = workspaceCardFeedsKeys_1[_i];
        // Example: "cards_18755165_Expensify Card" -> "Expensify Card"
        var bankName = key.split('_').at(2);
        if (bankName) {
            bankFrequency[bankName] = (bankFrequency[bankName] || 0) + 1;
        }
    }
    for (var _a = 0, _b = Object.values(domainFeedsData); _a < _b.length; _a++) {
        var domainFeed = _b[_a];
        bankFrequency[domainFeed.bank] = (bankFrequency[domainFeed.bank] || 0) + 1;
    }
    return Object.keys(bankFrequency).filter(function (bank) {
        return bankFrequency[bank] > 1;
    });
}
/**
 * @returns string with the 'cards_' part removed from the beginning
 */
function getCardFeedKey(workspaceCardFeeds, workspaceFeedKey) {
    var workspaceFeed = workspaceCardFeeds ? workspaceCardFeeds[workspaceFeedKey] : undefined;
    if (!workspaceFeed) {
        return;
    }
    var representativeCard = Object.values(workspaceFeed).find(function (cardFeedItem) {
        return CardUtils_1.isCard(cardFeedItem);
    });
    if (!representativeCard) {
        return;
    }
    var fundID = representativeCard.fundID,
        bank = representativeCard.bank;
    return createCardFeedKey(fundID, bank);
}
exports.getCardFeedKey = getCardFeedKey;
/**
 * @returns string with added 'cards_' substring at the beginning
 */
function getWorkspaceCardFeedKey(cardFeedKey) {
    if (!cardFeedKey.startsWith(ONYXKEYS_1['default'].COLLECTION.WORKSPACE_CARDS_LIST)) {
        return '' + ONYXKEYS_1['default'].COLLECTION.WORKSPACE_CARDS_LIST + cardFeedKey;
    }
    return cardFeedKey;
}
exports.getWorkspaceCardFeedKey = getWorkspaceCardFeedKey;
function createCardFilterItem(card, personalDetailsList, selectedCards, illustrations) {
    var _a, _b, _c, _d;
    var personalDetails = personalDetailsList[(_a = card === null || card === void 0 ? void 0 : card.accountID) !== null && _a !== void 0 ? _a : CONST_1['default'].DEFAULT_NUMBER_ID];
    var isSelected = selectedCards.includes(card.cardID.toString());
    var icon = CardUtils_1.getCardFeedIcon(card === null || card === void 0 ? void 0 : card.bank, illustrations);
    var cardName = (_b = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _b === void 0 ? void 0 : _b.cardTitle;
    var text = (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.displayName) !== null && _c !== void 0 ? _c : cardName;
    return {
        lastFourPAN: card.lastFourPAN,
        isVirtual: (_d = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _d === void 0 ? void 0 : _d.isVirtual,
        shouldShowOwnersAvatar: true,
        cardName: cardName,
        cardOwnerPersonalDetails: personalDetails !== null && personalDetails !== void 0 ? personalDetails : undefined,
        text: text,
        keyForList: card.cardID.toString(),
        isSelected: isSelected,
        bankIcon: {
            icon: icon,
        },
        isCardFeed: false,
        cardFeedKey: '',
    };
}
function buildCardsData(workspaceCardFeeds, userCardList, personalDetailsList, selectedCards, illustrations, isClosedCards) {
    if (isClosedCards === void 0) {
        isClosedCards = false;
    }
    // Filter condition to build different cards data for closed cards and individual cards based on the isClosedCards flag, we don't want to show closed cards in the individual cards section
    var filterCondition = function (card) {
        return isClosedCards ? CardUtils_1.isCardClosed(card) : !CardUtils_1.isCardHiddenFromSearch(card) && !CardUtils_1.isCardClosed(card);
    };
    var userAssignedCards = Object.values(userCardList !== null && userCardList !== void 0 ? userCardList : {})
        .filter(function (card) {
            return filterCondition(card);
        })
        .map(function (card) {
            return createCardFilterItem(card, personalDetailsList, selectedCards, illustrations);
        });
    // When user is admin of a workspace he sees all the cards of workspace under cards_ Onyx key
    var allWorkspaceCards = Object.values(workspaceCardFeeds)
        .filter(function (cardFeed) {
            return !EmptyObject_1.isEmptyObject(cardFeed);
        })
        .flatMap(function (cardFeed) {
            return Object.values(cardFeed)
                .filter(function (card) {
                    return card && CardUtils_1.isCard(card) && !(userCardList === null || userCardList === void 0 ? void 0 : userCardList[card.cardID]) && filterCondition(card);
                })
                .map(function (card) {
                    return createCardFilterItem(card, personalDetailsList, selectedCards, illustrations);
                });
        });
    var allCardItems = __spreadArrays(userAssignedCards, allWorkspaceCards);
    var selectedCardItems = [];
    var unselectedCardItems = [];
    allCardItems.forEach(function (card) {
        if (card.isSelected) {
            selectedCardItems.push(card);
        } else {
            unselectedCardItems.push(card);
        }
    });
    return {selected: selectedCardItems, unselected: unselectedCardItems};
}
exports.buildCardsData = buildCardsData;
/**
 * @param cardList - The list of cards to process. Can be undefined.
 * @returns a record where keys are domain names and values contain domain feed data.
 */
function generateDomainFeedData(cardList) {
    return Object.values(cardList !== null && cardList !== void 0 ? cardList : {}).reduce(function (domainFeedData, currentCard) {
        var _a, _b;
        // Cards in cardList can also be domain cards, we use them to compute domain feed
        if (
            !((_a = currentCard === null || currentCard === void 0 ? void 0 : currentCard.domainName) === null || _a === void 0
                ? void 0
                : _a.match(CONST_1['default'].REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)) &&
            !CardUtils_1.isCardHiddenFromSearch(currentCard) &&
            currentCard.fundID
        ) {
            if (domainFeedData[currentCard.fundID + '_' + currentCard.bank]) {
                domainFeedData[currentCard.fundID + '_' + currentCard.bank].correspondingCardIDs.push(currentCard.cardID.toString());
            } else {
                // if the cards belongs to the same domain, every card of it should have the same fundID
                // eslint-disable-next-line no-param-reassign
                domainFeedData[currentCard.fundID + '_' + currentCard.bank] = {
                    fundID: currentCard.fundID,
                    domainName: currentCard.domainName,
                    bank: currentCard === null || currentCard === void 0 ? void 0 : currentCard.bank,
                    correspondingCardIDs: [(_b = currentCard.cardID) === null || _b === void 0 ? void 0 : _b.toString()],
                };
            }
        }
        return domainFeedData;
    }, {});
}
exports.generateDomainFeedData = generateDomainFeedData;
function getDomainFeedData(workspaceCardFeeds) {
    var flattenedWorkspaceCardFeeds = Object.values(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : {}).reduce(function (result, domainCards) {
        Object.assign(result, domainCards);
        return result;
    }, {});
    return generateDomainFeedData(flattenedWorkspaceCardFeeds);
}
exports.getDomainFeedData = getDomainFeedData;
function getWorkspaceCardFeedData(cardFeed, repeatingBanks, translate) {
    var _a, _b;
    var cardFeedArray = Object.values(cardFeed !== null && cardFeed !== void 0 ? cardFeed : {});
    var representativeCard = cardFeedArray.find(function (cardFeedItem) {
        return CardUtils_1.isCard(cardFeedItem);
    });
    if (
        !representativeCard ||
        !cardFeedArray.some(function (cardFeedItem) {
            return CardUtils_1.isCard(cardFeedItem) && !CardUtils_1.isCardHiddenFromSearch(cardFeedItem);
        })
    ) {
        return;
    }
    var domainName = representativeCard.domainName,
        bank = representativeCard.bank;
    var isBankRepeating = repeatingBanks.includes(bank);
    var policyID = (_b = (_a = domainName.match(CONST_1['default'].REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : '';
    var correspondingPolicy = PolicyUtils_1.getPolicy(policyID === null || policyID === void 0 ? void 0 : policyID.toUpperCase());
    var cardFeedLabel = isBankRepeating ? (correspondingPolicy === null || correspondingPolicy === void 0 ? void 0 : correspondingPolicy.name) : undefined;
    var cardFeedBankName = bank === CONST_1['default'].EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : CardUtils_1.getBankName(bank);
    var cardName =
        cardFeedBankName === CONST_1['default'].COMPANY_CARDS.CARD_TYPE.CSV
            ? translate('search.filters.card.cardFeedNameCSV', {cardFeedLabel: cardFeedLabel})
            : translate('search.filters.card.cardFeedName', {cardFeedBankName: cardFeedBankName, cardFeedLabel: cardFeedLabel});
    return {
        cardName: cardName,
        bank: bank,
        label: cardFeedLabel,
        type: 'workspace',
    };
}
function getDomainCardFeedData(domainFeed, repeatingBanks, translate) {
    var domainName = domainFeed.domainName,
        bank = domainFeed.bank;
    var isBankRepeating = repeatingBanks.includes(bank);
    var cardFeedBankName = bank === CONST_1['default'].EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : CardUtils_1.getBankName(bank);
    var cardFeedLabel = isBankRepeating ? PolicyUtils_1.getDescriptionForPolicyDomainCard(domainName) : undefined;
    var cardName =
        cardFeedBankName === CONST_1['default'].COMPANY_CARDS.CARD_TYPE.CSV
            ? translate('search.filters.card.cardFeedNameCSV', {cardFeedLabel: cardFeedLabel})
            : translate('search.filters.card.cardFeedName', {cardFeedBankName: cardFeedBankName, cardFeedLabel: cardFeedLabel});
    return {
        cardName: cardName,
        bank: bank,
        label: cardFeedLabel,
        type: 'domain',
    };
}
function filterOutDomainCards(workspaceCardFeeds) {
    var domainFeedData = getDomainFeedData(workspaceCardFeeds);
    return Object.entries(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : {}).filter(function (_a) {
        var _b;
        var workspaceFeed = _a[1];
        var domainFeed = (_b = Object.values(workspaceFeed !== null && workspaceFeed !== void 0 ? workspaceFeed : {}).at(0)) !== null && _b !== void 0 ? _b : {};
        if (Object.keys(domainFeedData).includes(domainFeed.fundID + '_' + domainFeed.bank)) {
            return false;
        }
        return !EmptyObject_1.isEmptyObject(workspaceFeed);
    });
}
function getCardFeedsData(_a) {
    var workspaceCardFeeds = _a.workspaceCardFeeds,
        translate = _a.translate;
    var domainFeedData = getDomainFeedData(workspaceCardFeeds);
    var repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds !== null && workspaceCardFeeds !== void 0 ? workspaceCardFeeds : CONST_1['default'].EMPTY_OBJECT), domainFeedData);
    var cardFeedData = {};
    filterOutDomainCards(workspaceCardFeeds).forEach(function (_a) {
        var cardFeedKey = _a[0],
            cardFeed = _a[1];
        var workspaceData = getWorkspaceCardFeedData(cardFeed, repeatingBanks, translate);
        if (workspaceData) {
            cardFeedData[cardFeedKey] = workspaceData;
        }
    });
    Object.values(domainFeedData).forEach(function (domainFeed) {
        var cardFeedKey = createCardFeedKey('cards_' + domainFeed.fundID, domainFeed.bank);
        cardFeedData[cardFeedKey] = getDomainCardFeedData(domainFeed, repeatingBanks, translate);
    });
    return cardFeedData;
}
function getCardFeedNamesWithType(params) {
    var cardFeedData = getCardFeedsData(params);
    return Object.keys(cardFeedData).reduce(function (cardFeedNamesWithType, cardFeedKey) {
        /* eslint-disable-next-line no-param-reassign */
        cardFeedNamesWithType[cardFeedKey] = {
            name: cardFeedData[cardFeedKey].cardName,
            type: cardFeedData[cardFeedKey].type,
        };
        return cardFeedNamesWithType;
    }, {});
}
exports.getCardFeedNamesWithType = getCardFeedNamesWithType;
function createCardFeedKey(fundID, bank) {
    if (!fundID) {
        return bank;
    }
    return fundID + '_' + bank;
}
exports.createCardFeedKey = createCardFeedKey;
function createCardFeedItem(_a) {
    var cardName = _a.cardName,
        bank = _a.bank,
        keyForList = _a.keyForList,
        cardFeedKey = _a.cardFeedKey,
        correspondingCardIDs = _a.correspondingCardIDs,
        selectedCards = _a.selectedCards,
        illustrations = _a.illustrations;
    var isSelected = correspondingCardIDs.every(function (card) {
        return selectedCards.includes(card);
    });
    var icon = CardUtils_1.getCardFeedIcon(bank, illustrations);
    return {
        text: cardName,
        keyForList: keyForList,
        isSelected: isSelected,
        shouldShowOwnersAvatar: false,
        bankIcon: {
            icon: icon,
        },
        cardFeedKey: cardFeedKey,
        isCardFeed: true,
        correspondingCards: correspondingCardIDs,
    };
}
function buildCardFeedsData(workspaceCardFeeds, domainFeedsData, selectedCards, translate, illustrations) {
    var selectedFeeds = [];
    var unselectedFeeds = [];
    var repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds), domainFeedsData);
    Object.values(domainFeedsData).forEach(function (domainFeed) {
        var domainName = domainFeed.domainName,
            bank = domainFeed.bank,
            correspondingCardIDs = domainFeed.correspondingCardIDs;
        var cardFeedKey = createCardFeedKey(domainFeed.fundID, bank);
        var cardName = getDomainCardFeedData(domainFeed, repeatingBanks, translate).cardName;
        var feedItem = createCardFeedItem({
            cardName: cardName,
            bank: bank,
            correspondingCardIDs: correspondingCardIDs,
            keyForList: domainName + '-' + bank,
            cardFeedKey: cardFeedKey,
            selectedCards: selectedCards,
            illustrations: illustrations,
        });
        if (feedItem.isSelected) {
            selectedFeeds.push(feedItem);
        } else {
            unselectedFeeds.push(feedItem);
        }
    });
    filterOutDomainCards(workspaceCardFeeds).forEach(function (_a) {
        var workspaceFeedKey = _a[0],
            workspaceFeed = _a[1];
        var correspondingCardIDs = Object.entries(workspaceFeed !== null && workspaceFeed !== void 0 ? workspaceFeed : {})
            .filter(function (_a) {
                var cardKey = _a[0],
                    card = _a[1];
                return cardKey !== 'cardList' && CardUtils_1.isCard(card) && !CardUtils_1.isCardHiddenFromSearch(card);
            })
            .map(function (_a) {
                var cardKey = _a[0];
                return cardKey;
            });
        var cardFeedData = getWorkspaceCardFeedData(workspaceFeed, repeatingBanks, translate);
        if (!cardFeedData) {
            return;
        }
        var cardName = cardFeedData.cardName,
            bank = cardFeedData.bank;
        var cardFeedKey = getCardFeedKey(workspaceCardFeeds, workspaceFeedKey);
        var feedItem = createCardFeedItem({
            cardName: cardName,
            bank: bank,
            correspondingCardIDs: correspondingCardIDs,
            cardFeedKey: cardFeedKey !== null && cardFeedKey !== void 0 ? cardFeedKey : '',
            keyForList: workspaceFeedKey,
            selectedCards: selectedCards,
            illustrations: illustrations,
        });
        if (feedItem.isSelected) {
            selectedFeeds.push(feedItem);
        } else {
            unselectedFeeds.push(feedItem);
        }
    });
    return {selected: selectedFeeds, unselected: unselectedFeeds};
}
exports.buildCardFeedsData = buildCardFeedsData;
function getSelectedCardsFromFeeds(cards, workspaceCardFeeds, selectedFeeds) {
    var domainFeedsData = generateDomainFeedData(cards);
    var domainFeedCards = Object.fromEntries(
        Object.values(domainFeedsData).map(function (domainFeedData) {
            return [createCardFeedKey(domainFeedData.fundID, domainFeedData.bank), domainFeedData.correspondingCardIDs];
        }),
    );
    if (!workspaceCardFeeds || !selectedFeeds) {
        return [];
    }
    var selectedCards = selectedFeeds.flatMap(function (cardFeedKey) {
        var workspaceCardFeed = workspaceCardFeeds[getWorkspaceCardFeedKey(cardFeedKey)];
        if (!workspaceCardFeed) {
            if (!cards || Object.keys(domainFeedCards).length === 0) {
                return [];
            }
            return domainFeedCards[cardFeedKey].filter(function (cardNumber) {
                return cards[cardNumber].state !== CONST_1['default'].EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED;
            });
        }
        return Object.keys(workspaceCardFeed).filter(function (cardNumber) {
            return workspaceCardFeed[cardNumber].state !== CONST_1['default'].EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED;
        });
    });
    return __spreadArrays(new Set(selectedCards));
}
exports.getSelectedCardsFromFeeds = getSelectedCardsFromFeeds;
var generateSelectedCards = function (cardList, workspaceCardFeeds, feeds, cards) {
    var selectedCards = getSelectedCardsFromFeeds(cardList, workspaceCardFeeds, feeds);
    return __spreadArrays(new Set(__spreadArrays(selectedCards, cards !== null && cards !== void 0 ? cards : [])));
};
exports.generateSelectedCards = generateSelectedCards;
