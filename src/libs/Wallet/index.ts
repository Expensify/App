import type Wallet from './types';

const checkIfWalletIsAvailable: Wallet['checkIfWalletIsAvailable'] = () => {
    return Promise.resolve(false);
};

const handleAddCardToWallet: Wallet['handleAddCardToWallet'] = () => {
    return Promise.reject(new Error('Add to wallet is not supported on this platform'));
};

const isCardInWallet: Wallet['isCardInWallet'] = () => {
    // Return true for other platforms, so the AddToWalletButton is always hidden
    return Promise.resolve(true);
};

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
