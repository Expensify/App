import {ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';
import BankAccount from './BankAccount';
import Fund from './Fund';

type PaymentMethod = (BankAccount | Fund) & {
    description: string;
    icon: React.FC<SvgProps>;
    iconSize?: number;
    iconHeight?: number;
    iconWidth?: number;
    iconStyles?: ViewStyle[];
};

export default PaymentMethod;
