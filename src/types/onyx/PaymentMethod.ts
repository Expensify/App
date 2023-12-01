import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
import IconAsset from '@src/types/utils/IconAsset';
import BankAccount from './BankAccount';
import Fund from './Fund';

type PaymentMethod = (BankAccount | Fund) & {
    description: string;
    icon: IconAsset;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: Array<ViewStyle | CSSProperties>;
};

export default PaymentMethod;
