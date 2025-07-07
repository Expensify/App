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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddCardToWallet = handleAddCardToWallet;
exports.isCardInWallet = isCardInWallet;
exports.checkIfWalletIsAvailable = checkIfWalletIsAvailable;
var react_native_wallet_1 = require("@expensify/react-native-wallet");
var Wallet_1 = require("@libs/actions/Wallet");
var Log_1 = require("@libs/Log");
function checkIfWalletIsAvailable() {
    return (0, react_native_wallet_1.checkWalletAvailability)();
}
function handleAddCardToWallet(card, cardHolderName) {
    return (0, react_native_wallet_1.getSecureWalletInfo)().then(function (walletData) {
        return (0, Wallet_1.createDigitalGoogleWallet)(__assign({ cardID: card.cardID, cardHolderName: cardHolderName }, walletData)).then(function (cardData) { return (0, react_native_wallet_1.addCardToGoogleWallet)(cardData); });
    });
}
function isCardInWallet(card) {
    if (!card.lastFourPAN) {
        return Promise.resolve(false);
    }
    return (0, react_native_wallet_1.getCardStatusBySuffix)(card.lastFourPAN)
        .then(function (status) {
        Log_1.default.info("Card status: ".concat(status));
        return status === 'active';
    })
        .catch(function (error) {
        Log_1.default.warn("getCardTokenStatus error: ".concat(error));
        return false;
    });
}
