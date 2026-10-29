import type {Card} from '@src/types/onyx';

import type {ViewStyle, StyleProp} from 'react-native';

type AddToWalletButtonProps = {
    card: Card;
    cardHolderName: string;
    cardDescription: string;
    style?: StyleProp<ViewStyle>;
};

export default AddToWalletButtonProps;
