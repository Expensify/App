import type {Card} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

type AddToWalletButtonProps = {
    card: Card;
    cardHolderName: string;
    cardDescription: string;
    style?: ViewStyle;
};

export default AddToWalletButtonProps;
