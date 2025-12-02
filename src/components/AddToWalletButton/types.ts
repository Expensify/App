import type {ViewStyle} from 'react-native';
import type {Card} from '@src/types/onyx';

type AddToWalletButtonProps = {
    card: Card;
    cardHolderName: string;
    cardDescription: string;
    style?: ViewStyle;
};

export default AddToWalletButtonProps;
