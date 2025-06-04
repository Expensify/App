import type {TokenizationStatus} from '@expensify/react-native-wallet';
import type {Card} from '@src/types/onyx';

function checkIfWalletIsAvailable(): Promise<boolean> {
    return Promise.resolve(false);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleAddCardToWallet(_card: Card, _cardHolderName: string, _cardDescription: string, _onFinished?: () => void): Promise<TokenizationStatus> {
    return Promise.reject(new Error('Add to wallet is not supported on this platform'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isCardInWallet(_card: Card) {
    // Return true for other platforms, so the AddToWalletButton is always hidden
    return Promise.resolve(true);
}

export {handleAddCardToWallet, isCardInWallet, checkIfWalletIsAvailable};
