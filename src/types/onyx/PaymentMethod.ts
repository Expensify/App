import {SvgProps} from 'react-native-svg';
import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
import BankAccount from './BankAccount';
import Fund from './Fund';

type PaymentMethod = (BankAccount | Fund) & {
    description: string;
    icon: React.FC<SvgProps>;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: Array<ViewStyle | CSSProperties>;
};

export default PaymentMethod;
