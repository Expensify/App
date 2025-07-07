"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddCardToWallet = handleAddCardToWallet;
exports.isCardInWallet = isCardInWallet;
exports.checkIfWalletIsAvailable = checkIfWalletIsAvailable;
function checkIfWalletIsAvailable() {
    return Promise.resolve(false);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleAddCardToWallet(_card, _cardHolderName, _cardDescription, _onFinished) {
    return Promise.reject(new Error('Add to wallet is not supported on this platform'));
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isCardInWallet(_card) {
    // Return true for other platforms, so the AddToWalletButton is always hidden
    return Promise.resolve(true);
}
