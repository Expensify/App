import type {ViewStyle} from 'react-native';
import type IconAsset from '@src/types/utils/IconAsset';
import type BankAccount from './BankAccount';
import type Fund from './Fund';

type PaymentMethod = (BankAccount | Fund) & {
    description: string;
    icon: IconAsset;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: ViewStyle[];
};

export default PaymentMethod;
