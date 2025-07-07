"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddCardToWallet = handleAddCardToWallet;
exports.isCardInWallet = isCardInWallet;
exports.checkIfWalletIsAvailable = checkIfWalletIsAvailable;
var react_native_wallet_1 = require("@expensify/react-native-wallet");
var Wallet_1 = require("@libs/actions/Wallet");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
function checkIfWalletIsAvailable() {
    return (0, react_native_wallet_1.checkWalletAvailability)();
}
function handleAddCardToWallet(card, cardHolderName, cardDescription) {
    var data = {
        network: CONST_1.default.COMPANY_CARDS.CARD_TYPE.VISA,
        lastDigits: card.lastFourPAN,
        cardDescription: cardDescription,
        cardHolderName: cardHolderName,
    };
    return (0, react_native_wallet_1.addCardToAppleWallet)(data, Wallet_1.issuerEncryptPayloadCallback);
}
function isCardInWallet(card) {
    var _a;
    var panReferenceID = (_a = card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.expensifyCard_panReferenceID;
    if (!panReferenceID) {
        return Promise.resolve(false);
    }
    var callback = null;
    if (card.token) {
        callback = (0, react_native_wallet_1.getCardStatusByIdentifier)(panReferenceID, CONST_1.default.COMPANY_CARDS.CARD_TYPE.VISA);
    }
    else if (card.lastFourPAN) {
        callback = (0, react_native_wallet_1.getCardStatusBySuffix)(card.lastFourPAN);
    }
    if (callback) {
        return callback
            .then(function (status) {
            Log_1.default.info("Card status: ".concat(status));
            return status === 'active';
        })
            .catch(function (e) {
            Log_1.default.warn("isCardInWallet error: ".concat(e));
            return Promise.resolve(false);
        });
    }
    return Promise.resolve(false);
}
