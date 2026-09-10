import type {Card} from '@src/types/onyx';

import type {TokenizationStatus} from '@expensify/react-native-wallet';

type Wallet = {
    checkIfWalletIsAvailable: () => Promise<boolean>;
    handleAddCardToWallet: (card: Card, cardHolderName: string, cardDescription: string, onFinished?: () => void) => Promise<TokenizationStatus>;
    isCardInWallet: (card: Card) => Promise<boolean>;
};

export default Wallet;
