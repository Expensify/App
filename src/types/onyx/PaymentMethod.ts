import {CSSProperties} from 'react';
import {ImageSourcePropType, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';
import BankAccount from './BankAccount';
import Fund from './Fund';

type PaymentMethod = (BankAccount | Fund) & {
    description: string;
    icon: React.FC<SvgProps> | ImageSourcePropType;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: Array<ViewStyle | CSSProperties>;
};

export default PaymentMethod;
